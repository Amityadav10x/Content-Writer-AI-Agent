import requests
import json
import time

def test_generation():
    url = "http://localhost:8000/generate"
    payload = {
        "topic": "The future of Agentic AI in 2025",
        "user_id": "test_user"
    }
    
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.text)
        return

    job_id = response.json()["job_id"]
    print(f"Job started: {job_id}")
    
    stream_url = f"http://localhost:8000/stream/{job_id}"
    print(f"Streaming from {stream_url}...")
    
    with requests.get(stream_url, stream=True) as r:
        for line in r.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("data: "):
                    data = json.loads(decoded_line[6:])
                    event_type = data.get("type")
                    if event_type == "status":
                        print(f"Status: {data['data']['status']}")
                        if data['data']['status'] in ["completed", "failed"]:
                            break
                    elif event_type == "node_start":
                        print(f"  [NODE START] {data['data']['node']}")
                    elif event_type == "node_end":
                        print(f"  [NODE END] {data['data']['node']}")
                    elif event_type == "token":
                        # print(".", end="", flush=True)
                        pass
                    elif event_type == "artifact_complete":
                        print(f"\n[ARTIFACT COMPLETE] Content length: {len(data['data']['content'])}")

if __name__ == "__main__":
    test_generation()
