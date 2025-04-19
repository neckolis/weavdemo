import requests

# Replace with your actual Cloud Run URL
gcp_url = "https://backend-314893983271.us-central1.run.app"  # <-- update this!

# 1. Health check (if you have a /health endpoint)
try:
    r = requests.get(f"{gcp_url}/health")
    print("/health status:", r.status_code, r.text)
except Exception as e:
    print("/health error:", e)

# 2. Try uploading a text file (if you have /upload endpoint)
files = {"files": ("test.txt", b"This is a test file for upload.")}
try:
    r = requests.post(f"{gcp_url}/upload", files=files)
    print("/upload status:", r.status_code)
    print("/upload response:", r.text)
except Exception as e:
    print("/upload error:", e)

# 3. (Optional) Try a vector search endpoint if you have one
# r = requests.post(f"{gcp_url}/search", json={"query": "your search text"})
# print("/search status:", r.status_code, r.text)
