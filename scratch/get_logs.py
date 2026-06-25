import boto3
import json
import sys

client = boto3.client('logs', region_name='ap-south-1')
try:
    response = client.get_log_events(
        logGroupName='/ecs/jeevansetu',
        logStreamName='web/jeevansetu-web/01b53b0e04494ba4819acf67b1646516',
        limit=100
    )
    
    with open("scratch/web_logs.txt", "w", encoding="utf-8", errors="ignore") as f:
        for event in response.get('events', []):
            msg = event.get('message', '')
            f.write(msg + "\n")
    print("SUCCESS: Logs written to scratch/web_logs.txt")
except Exception as e:
    print(f"Error: {e}")
