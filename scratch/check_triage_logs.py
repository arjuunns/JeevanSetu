import subprocess, json, time

# Look at last 10 minutes, filter for triage-related messages
start_ms = int((time.time() - 600) * 1000)

cmd = [
    'aws', 'logs', 'filter-log-events',
    '--log-group-name', '/ecs/jeevansetu',
    '--log-stream-name-prefix', 'server',
    '--filter-pattern', '429 OR heuristic OR fallback OR "Triage AI" OR "triage assessment" OR "Triage assessment"',
    '--start-time', str(start_ms),
    '--limit', '10',
    '--region', 'ap-south-1'
]

res = subprocess.run(cmd, capture_output=True)
text = res.stdout.decode('utf-8', errors='ignore')
data = json.loads(text)
events = data.get('events', [])

print(f'Triage-related events in last 10 min: {len(events)}')
for e in events:
    ts = time.strftime('%H:%M:%S', time.localtime(e['timestamp'] / 1000))
    try:
        obj = json.loads(e['message'])
        level = obj.get('level', 30)
        level_str = 'ERROR' if level >= 50 else ('WARN' if level >= 40 else 'INFO')
        msg = str(obj.get('msg', ''))[:200]
        err = str(obj.get('err', {}).get('message', ''))[:200]
        print(f'  [{ts}][{level_str}] {msg}')
        if err:
            print(f'    ERR: {err[:150]}')
    except Exception:
        print('  [' + ts + '][RAW] ' + str(e['message'])[:200])
