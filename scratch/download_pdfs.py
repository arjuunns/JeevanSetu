import urllib.request
import ssl
import os

ssl_context = ssl._create_unverified_context()

def download_file(url, output_path):
    print(f"Downloading {url} -> {output_path}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with urllib.request.urlopen(req, context=ssl_context) as response, open(output_path, 'wb') as out_file:
            out_file.write(response.read())
        print("Success!")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

if __name__ == "__main__":
    # 1. CTAS Guideline
    download_file(
        "https://www.cper.ca/images/pdfs/Prehospital_CTAS_Paramedic_Guide_v2.0_Final.pdf",
        "medical-pdf/CTAS-Guidelines.pdf"
    )
    # 2. National Field Triage Guidelines
    download_file(
        "https://www.cper.ca/images/pdfs/equipment_and_standards/Field_Triage_Decision_Scheme.pdf",
        "medical-pdf/National-Guideline-for-the-Field-Triage-of-Injured-Patients.pdf"
    )
