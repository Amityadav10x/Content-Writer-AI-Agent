from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
import asyncio
import json
import os
from datetime import datetime
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

# In-memory storage for jobs
jobs: Dict[str, dict] = {}
job_queues: Dict[str, List[asyncio.Queue]] = {}

class GenerateRequest(BaseModel):
    topic: str
    as_of: Optional[str] = None

async def notify_job_update(job_id: str):
    """Push the current job state to all active stream queues for this job."""
    if job_id in job_queues:
        data = json.dumps(jobs[job_id])
        for queue in job_queues[job_id]:
            await queue.put(data)

@app.post("/generate")
async def generate_blog(request: GenerateRequest, background_tasks: BackgroundTasks):
    # Simple cleanup: keep only last 100 jobs
    if len(jobs) > 100:
        oldest_jobs = sorted(jobs.keys(), key=lambda k: jobs[k].get("created_at", ""))[:20]
        for k in oldest_jobs:
            del jobs[k]
            if k in job_queues:
                del job_queues[k]

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "starting", 
        "result": {}, 
        "logs": [],
        "created_at": datetime.now().isoformat()
    }
    
    # Run agent in background
    background_tasks.add_task(run_agent, job_id, request.topic, request.as_of)
    
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
        queue = asyncio.Queue()
        if job_id not in job_queues:
            job_queues[job_id] = []
        job_queues[job_id].append(queue)
        
        # Send initial state
        yield f"data: {json.dumps(jobs[job_id])}\n\n"
        
        try:
            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
                # If job finished, we can close the stream after the final update
                status_data = json.loads(data)
                if status_data.get("status") in ["completed", "failed"]:
                    break
        except asyncio.CancelledError:
            pass
        finally:
            if job_id in job_queues:
                job_queues[job_id].remove(queue)
                if not job_queues[job_id]:
                    del job_queues[job_id]

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def run_agent(job_id: str, topic: str, as_of: Optional[str]):
    try:
        inputs = {
            "topic": topic,
            "as_of": as_of or datetime.now().strftime("%Y-%m-%d"),
            "sections": [],
            "evidence": [],
            "queries": [],
            "needs_research": False,
            "mode": "closed_book"
        }
        
        jobs[job_id]["status"] = "running"
        jobs[job_id]["logs"].append(f"Starting workflow for topic: {topic}")
        await notify_job_update(job_id)

        # Stream updates from the graph
        async for event in agent_app.astream(inputs, stream_mode="updates"):
            # event is a dict like {'node_name': {state_updates}}
            for node_name, updates in event.items():
                jobs[job_id]["logs"].append(f"Agent reached node: {node_name}")
                
                # Update job state based on node output
                if jobs[job_id].get("result") is None:
                    jobs[job_id]["result"] = {}

                if "evidence" in updates:
                    jobs[job_id]["result"]["evidence"] = [e.model_dump() if hasattr(e, "model_dump") else e for e in updates["evidence"]]
                
                if "plan" in updates:
                    jobs[job_id]["result"]["plan"] = updates["plan"].model_dump() if hasattr(updates["plan"], "model_dump") else updates["plan"]
                
                if "queries" in updates:
                    jobs[job_id]["result"]["queries"] = updates["queries"]
                if "final" in updates:
                    jobs[job_id]["result"]["final"] = updates["final"]
                
                await notify_job_update(job_id)

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["logs"].append("Workflow completed successfully.")
        await notify_job_update(job_id)
        
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        error_msg = f"Error in agent workflow: {str(e)}"
        jobs[job_id]["error"] = error_msg
        jobs[job_id]["logs"].append(error_msg)
        await notify_job_update(job_id)
        print(f"Error for job {job_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
