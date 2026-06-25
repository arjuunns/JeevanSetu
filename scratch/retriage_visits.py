"""
Re-run AI triage for all visits that have heuristic fallback reasoning.
"""
import json, urllib.request

API_BASE = "http://jeevansetu-alb-934006077.ap-south-1.elb.amazonaws.com:4000/api/v1"

# 1. Fetch review queue
req = urllib.request.Request(f"{API_BASE}/reviews/queue")
with urllib.request.urlopen(req, timeout=10) as resp:
    raw = resp.read().decode('utf-8')

# The response might be wrapped in {data: [...]}
parsed = json.loads(raw)
if isinstance(parsed, dict):
    queue = parsed.get('data', parsed.get('items', [parsed]))
else:
    queue = parsed

print(f"Found {len(queue)} items in review queue")

rerun_count = 0
skip_count = 0
for item in queue:
    if isinstance(item, str):
        print("Item is string, skipping:", item[:80])
        continue

    reasoning = item.get('reasoning') or {}
    if isinstance(reasoning, str):
        reasoning = {}
    text = reasoning.get('reasoningText', '') if reasoning else ''
    visit_id = item.get('visitId', item.get('id', ''))

    if not visit_id:
        print("No visitId found, skipping item")
        continue

    if '[HEURISTIC FALLBACK]' in text or not text:
        print(f"Re-running triage for visitId={visit_id} ...")
        try:
            post_req = urllib.request.Request(
                f"{API_BASE}/triage/visits/{visit_id}/triage",
                data=b'{}',
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(post_req, timeout=45) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                # Handle wrapped response
                if isinstance(result, dict) and 'data' in result:
                    result = result['data']
                model = result.get('model', 'unknown')
                fallback = result.get('usedFallback', True)
                severity = (result.get('result') or {}).get('severity', '?')
                print(f"  -> severity={severity}, model={model}, fallback={fallback}")
                rerun_count += 1
        except Exception as e:
            print(f"  -> FAILED: {e}")
    else:
        print(f"  visitId={visit_id}: already has AI reasoning, skipping")
        skip_count += 1

print(f"\nDone. Re-ran: {rerun_count}, Skipped (already AI): {skip_count}")
