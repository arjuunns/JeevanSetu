import boto3

client = boto3.client('logs', region_name='ap-south-1')
try:
    response = client.get_log_events(
        logGroupName='/ecs/jeevansetu',
        logStreamName='server/jeevansetu-server/61a65f95eea84a9798c6680609f08baf',
        limit=100
    )
    
    with open("scratch/server_logs.txt", "w", encoding="utf-8", errors="ignore") as f:
        for event in response.get('events', []):
            msg = event.get('message', '')
            f.write(msg + "\n")
    print("SUCCESS: Logs written to scratch/server_logs.txt")
except Exception as e:
    print(f"Error: {e}")
