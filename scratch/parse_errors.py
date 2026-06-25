import json

try:
    with open("scratch/errors.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    events = data.get("events", [])
    output = []
    for e in events:
        msg = e.get("message", "")
        # Parse nested json message if possible
        try:
            parsed_msg = json.loads(msg)
            msg = json.dumps(parsed_msg, indent=2)
        except Exception:
            pass
        output.append(f"Timestamp: {e.get('timestamp')}\nMessage: {msg}\n{'-'*50}\n")
        
    with open("scratch/errors_parsed.txt", "w", encoding="ascii", errors="ignore") as f:
        f.writelines(output)
    print("SUCCESS")
except Exception as e:
    print(f"Error: {e}")
