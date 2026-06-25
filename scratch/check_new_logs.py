import subprocess, json, time

# Only look at logs from the last 5 minutes (after the new task started)
start_ms = int((time.time() - 300) * 1000)

cmd = [
    'aws', 'logs', 'filter-log-events',
    '--log-group-name', '/ecs/jeevansetu',
    '--log-stream-name-prefix', 'server',
    '--start-time', str(start_ms),
    '--limit', '20',
    '--region', 'ap-south-1'
]

res = subprocess.run(cmd, capture_output=True)
text = res.stdout.decode('utf-8', errors='ignore')
data = json.loads(text)
events = data.get('events', [])

print(f'Events since new deployment: {len(events)}')
for e in events:
    try:
        obj = json.loads(e['message'])
        level = obj.get('level', 30)
        level_str = 'ERROR' if level >= 50 else ('WARN' if level >= 40 else 'INFO')
        msg = str(obj.get('msg', ''))[:150]
        print(f'  [{level_str}] {msg}')
    except Exception:
        print('  [RAW] ' + str(e['message'])[:150])
