from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import asyncio
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
jobs = {}

class GenerateRequest(BaseModel):
    topic: str
    as_of: Optional[str] = None

@app.post("/generate")
async def generate_blog(request: GenerateRequest, background_tasks: BackgroundTasks):
    # Simple cleanup: keep only last 100 jobs
    if len(jobs) > 100:
        oldest_jobs = sorted(jobs.keys(), key=lambda k: jobs[k].get("created_at", ""))[:20]
        for k in oldest_jobs:
            del jobs[k]

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
                
                if "final" in updates:
                    jobs[job_id]["result"]["final"] = updates["final"]

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["logs"].append("Workflow completed successfully.")
        
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        error_msg = f"Error in agent workflow: {str(e)}"
        jobs[job_id]["error"] = error_msg
        jobs[job_id]["logs"].append(error_msg)
        print(f"Error for job {job_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
