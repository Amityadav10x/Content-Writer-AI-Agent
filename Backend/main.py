from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from agent_logic import app as agent_app

# Create images directory if not exists
os.makedirs("images", exist_ok=True)

app = FastAPI(title="Blog Writing Agent API")

# Serve images directory
app.mount("/images", StaticFiles(directory="images"), name="images")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Blog Writing Agent API is online", "status": "active"}

# In-memory storage for jobs
jobs: Dict[str, dict] = {}
job_queues: Dict[str, List[asyncio.Queue]] = {}

TRACKED_NODES = {"retrieve_memory", "router", "research", "orchestrator", "worker", "reducer", "extract_memory"}

class GenerateRequest(BaseModel):
    topic: str
    mode: str = "open_book"
    recency_days: int = 365
    user_id: str = "default_user"


def safe_serialize(obj: Any) -> Any:
    """Recursively make an object JSON-serializable."""
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, dict):
        return {k: safe_serialize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [safe_serialize(i) for i in obj]
    if hasattr(obj, "model_dump"):
        return safe_serialize(obj.model_dump())
    return str(obj)


async def push_event(job_id: str, event_data: dict):
    """Push a typed SSE event to all active listeners for this job."""
    if job_id in job_queues:
        data_str = json.dumps(event_data)
        for q in job_queues[job_id]:
            await q.put(data_str)


@app.post("/generate")
async def generate_blog(request: GenerateRequest, background_tasks: BackgroundTasks):
    # Simple cleanup: keep only last 100 jobs
    if len(jobs) > 100:
        oldest = sorted(jobs.keys(), key=lambda k: jobs[k].get("created_at", ""))[:20]
        for k in oldest:
            jobs.pop(k, None)
            job_queues.pop(k, None)

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "starting",
        "result": {},
        "logs": [],
        "created_at": datetime.now().isoformat(),
    }

    background_tasks.add_task(run_agent, job_id, request.topic, None, request.user_id)
    return {"job_id": job_id}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


@app.get("/stream/{job_id}")
async def stream_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        queue: asyncio.Queue = asyncio.Queue()
        job_queues.setdefault(job_id, []).append(queue)

        # Send initial sync event so frontend knows the job started
        yield f"data: {json.dumps({'type': 'sync', 'data': jobs[job_id]})}\n\n"

        try:
            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
                # Close stream once we get a terminal status
                parsed = json.loads(data)
                if parsed.get("type") == "status" and parsed.get("data", {}).get("status") in ("completed", "failed", "cancelled"):
                    break
        except asyncio.CancelledError:
            pass
        finally:
            if job_id in job_queues:
                try:
                    job_queues[job_id].remove(queue)
                except ValueError:
                    pass
                if not job_queues[job_id]:
                    del job_queues[job_id]

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/cancel/{job_id}")
async def cancel_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    jobs[job_id]["status"] = "cancelled"
    await push_event(job_id, {"type": "status", "data": {"status": "cancelled"}})
    return {"status": "ok"}


async def run_agent(job_id: str, topic: str, as_of: Optional[str], user_id: str):
    print(f"\n{'='*60}")
    print(f">>> [WORKFLOW START]")
    print(f"    Thread : {job_id}")
    print(f"    Topic  : {topic}")
    print(f"{'='*60}")

    try:
        inputs = {
            "topic": topic,
            "as_of": as_of or datetime.now().strftime("%Y-%m-%d"),
            "user_id": user_id,
            "memory_context": None,
            "sections": [],
            "evidence": [],
            "queries": [],
            "needs_research": False,
            "mode": "closed_book",
        }

        jobs[job_id]["status"] = "running"
        await push_event(job_id, {"type": "status", "data": {"status": "running"}})

        final_content = ""

        # Single streaming pass — no second ainvoke
        async for event in agent_app.astream_events(inputs, version="v2"):
            kind = event["event"]
            name = event.get("name", "")

            # ── Node lifecycle ────────────────────────────────────────────
            if kind == "on_chain_start" and name in TRACKED_NODES:
                print(f"\n  ┌─ [NODE START] {name.upper()}")
                await push_event(job_id, {"type": "node_start", "data": {"node": name}})

            if kind == "on_chain_end" and name in TRACKED_NODES:
                raw_output = event["data"].get("output", {})
                safe_output = safe_serialize(raw_output)

                # Capture the final blog markdown from the reducer
                if name == "reducer" and isinstance(safe_output, dict):
                    final_content = safe_output.get("final", final_content)

                print(f"  └─ [NODE END]   {name.upper()}")
                await push_event(job_id, {"type": "node_end", "data": {"node": name, "output": safe_output}})

            # ── Token-level streaming ────────────────────────────────────
            if kind == "on_chat_model_stream":
                chunk = event["data"].get("chunk")
                if chunk and chunk.content:
                    await push_event(job_id, {"type": "token", "data": {"content": chunk.content, "node": name}})

            # ── Graph-level completion ───────────────────────────────────
            if kind == "on_chain_end" and name == "LangGraph":
                output = event["data"].get("output", {})
                if isinstance(output, dict) and output.get("final"):
                    final_content = output["final"]

        # Workflow done
        print(f"\n{'='*60}")
        print(f">>> [WORKFLOW COMPLETE] Thread: {job_id}")
        print(f"    Final content length: {len(final_content)} chars")
        print(f"{'='*60}\n")

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = {"final": final_content}

        await push_event(job_id, {"type": "artifact_complete", "data": {"content": final_content}})
        await push_event(job_id, {"type": "status", "data": {"status": "completed"}})

    except Exception as e:
        print(f"\n{'!'*60}")
        print(f"!!! [WORKFLOW ERROR] {e}")
        print(f"{'!'*60}\n")
        import traceback
        traceback.print_exc()
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        await push_event(job_id, {"type": "status", "data": {"status": "failed", "error": str(e)}})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
