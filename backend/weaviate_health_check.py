import os
import requests
from dotenv import load_dotenv

load_dotenv()

url = os.environ["WEAVIATE_URL"]
if not url.startswith("http"):
    url = "https://" + url

health_endpoints = [
    f"{url}/v1/.well-known/live",
    f"{url}/v1/.well-known/ready",
    f"{url}/v1/.well-known/openid-configuration",
]

for ep in health_endpoints:
    try:
        resp = requests.get(ep, timeout=10)
        print(f"{ep} => {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"{ep} => ERROR: {e}")
