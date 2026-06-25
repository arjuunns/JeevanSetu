import subprocess
import json

cmd = [
    "aws", "logs", "describe-log-streams",
    "--log-group-name", "/ecs/jeevansetu",
    "--order-by", "LastEventTime",
    "--descending",
    "--limit", "10",
    "--region", "ap-south-1"
]

result = subprocess.run(cmd, capture_output=True, text=True, errors="ignore")
with open("scratch/streams.txt", "w", encoding="ascii", errors="ignore") as f:
    f.write(result.stdout)
print("Log streams written to scratch/streams.txt")
