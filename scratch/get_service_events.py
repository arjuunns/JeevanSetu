import subprocess
import json

cmd = [
    "aws", "ecs", "describe-services",
    "--cluster", "jeevansetu-cluster",
    "--services", "jeevansetu-web-service",
    "--region", "ap-south-1"
]

result = subprocess.run(cmd, capture_output=True, text=True, errors="ignore")
try:
    data = json.loads(result.stdout)
    events = data["services"][0]["events"]
    with open("scratch/service_events.txt", "w", encoding="ascii", errors="ignore") as f:
        for event in events[:15]:
            f.write(f"[{event['createdAt']}] {event['message']}\n")
    print("SUCCESS: Events written to scratch/service_events.txt")
except Exception as e:
    print("Error:", e)
