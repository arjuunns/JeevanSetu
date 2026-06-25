import boto3
import sys

client = boto3.client('logs', region_name='ap-south-1')
try:
    # Get latest stream name
    streams = client.describe_log_streams(
        logGroupName='/ecs/jeevansetu',
        orderBy='LastEventTime',
        descending=True,
        limit=5
    )
    
    # Filter for web log streams
    web_streams = [s['logStreamName'] for s in streams.get('logStreams', []) if 'web' in s['logStreamName']]
    if not web_streams:
        print("No web streams found")
        sys.exit(0)
        
    latest_stream = web_streams[0]
    print(f"Fetching logs from latest stream: {latest_stream}")
    
    response = client.get_log_events(
        logGroupName='/ecs/jeevansetu',
        logStreamName=latest_stream,
        limit=100
    )
    
    with open("scratch/new_web_logs.txt", "w", encoding="utf-8", errors="ignore") as f:
        for event in response.get('events', []):
            msg = event.get('message', '')
            f.write(msg + "\n")
    print("SUCCESS: Logs written to scratch/new_web_logs.txt")
except Exception as e:
    print(f"Error: {e}")
