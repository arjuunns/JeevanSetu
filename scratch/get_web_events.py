import subprocess
import json

cmd = [
    "aws", "logs", "get-log-events",
    "--log-group-name", "/ecs/jeevansetu",
    "--log-stream-name", "web/jeevansetu-web/01b53b0e04494ba4819acf67b1646516",
    "--limit", "100",
    "--region", "ap-south-1"
]

result = subprocess.run(cmd, capture_output=True, text=True, errors="ignore")
try:
    data = json.loads(result.stdout)
    with open("scratch/web_events.txt", "w", encoding="utf-8", errors="ignore") as f:
        for event in data.get("events", []):
            msg = event.get("message", "")
            f.write(msg + "\n")
    print("SUCCESS: Web log events written to scratch/web_events.txt")
except Exception as e:
    print("Error parsing JSON:", e)
