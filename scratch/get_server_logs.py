import boto3

client = boto3.client('logs', region_name='ap-south-1')
try:
    response = client.get_log_events(
        logGroupName='/ecs/jeevansetu',
        logStreamName='server/jeevansetu-server/e71488dab3544664b2f53ae18aef52fa',
        limit=100
    )
    
    with open("scratch/server_logs.txt", "w", encoding="utf-8", errors="ignore") as f:
        for event in response.get('events', []):
            msg = event.get('message', '')
            f.write(msg + "\n")
    print("SUCCESS: Logs written to scratch/server_logs.txt")
except Exception as e:
    print(f"Error: {e}")
