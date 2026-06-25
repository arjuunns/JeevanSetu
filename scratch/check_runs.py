import urllib.request
import json
import ssl

# Bypass SSL certificate verification
context = ssl._create_unverified_context()

url = "https://api.github.com/repos/arjuunns/JeevanSetu/actions/runs"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req, context=context) as response:
        data = json.loads(response.read().decode())
        runs = data.get("workflow_runs", [])
        if not runs:
            print("No workflow runs found.")
        else:
            latest = runs[0]
            print(f"Workflow: {latest.get('name')}")
            print(f"Event: {latest.get('event')}")
            print(f"Status: {latest.get('status')}")
            print(f"Conclusion: {latest.get('conclusion')}")
            print(f"URL: {latest.get('html_url')}")
            print(f"Jobs URL: {latest.get('jobs_url')}")
            
            # Fetch details about the jobs
            jobs_req = urllib.request.Request(latest.get('jobs_url'), headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(jobs_req, context=context) as jobs_resp:
                jobs_data = json.loads(jobs_resp.read().decode())
                for job in jobs_data.get("jobs", []):
                    print(f"\nJob: {job.get('name')} ({job.get('status')} - {job.get('conclusion')})")
                    for step in job.get("steps", []):
                        print(f"  Step: {step.get('name')} ({step.get('status')} - {step.get('conclusion')})")
except Exception as e:
    print(f"Error: {e}")
