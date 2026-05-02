import asyncio
import httpx
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

async def run_job(client, topic):
    print(f"Starting job for topic: {topic}")
    try:
        resp = await client.post(f"{BASE_URL}/generate", json={"topic": topic})
        if resp.status_code != 200:
            print(f"Failed to start job for {topic}: {resp.text}")
            return None
        
        job_id = resp.json().get("job_id")
        print(f"Job {job_id} started for {topic}")
        
        start_time = time.time()
        while True:
            await asyncio.sleep(5)
            status_resp = await client.get(f"{BASE_URL}/status/{job_id}")
            if status_resp.status_code != 200:
                print(f"Failed to get status for {job_id}: {status_resp.text}")
                break
            
            data = status_resp.json()
            status = data.get("status")
            print(f"Job {job_id} status: {status}")
            
            if status == "completed":
                duration = time.time() - start_time
                print(f"Job {job_id} COMPLETED in {duration:.2f}s")
                return True
            elif status == "failed":
                print(f"Job {job_id} FAILED: {data.get('error')}")
                # Print logs to see where it failed
                for log in data.get("logs", []):
                    print(f"  Log: {log}")
                return False
            
            # Timeout after 10 minutes
            if time.time() - start_time > 600:
                print(f"Job {job_id} TIMED OUT")
                return False
    except Exception as e:
        print(f"Exception for job {topic}: {e}")
        return False

async def main():
    topics = [
        "Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5",
        "Topic 6", "Topic 7", "Topic 8", "Topic 9", "Topic 10"
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Start all jobs concurrently
        tasks = [run_job(client, topic) for topic in topics]
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for r in results if r is True)
        print(f"\nSTRESS TEST RESULTS:")
        print(f"Total Jobs: {len(topics)}")
        print(f"Success: {success_count}")
        print(f"Failed/Timeout: {len(topics) - success_count}")

if __name__ == "__main__":
    asyncio.run(main())
