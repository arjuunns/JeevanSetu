import subprocess
import json

cmd = [
    "aws", "logs", "filter-log-events",
    "--log-group-name", "/ecs/jeevansetu",
    "--filter-pattern", "error",
    "--limit", "10",
    "--region", "ap-south-1"
]

res = subprocess.run(cmd, capture_output=True)
try:
    # Decode with utf-8 and ignore errors
    text = res.stdout.decode('utf-8', errors='ignore')
    data = json.loads(text)
    
    with open("scratch/errors.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("SUCCESS")
except Exception as e:
    print(f"Error: {e}")
