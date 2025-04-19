import os
import requests
from dotenv import load_dotenv

load_dotenv()

url = os.environ["WEAVIATE_URL"]
if not url.startswith("http"):
    url = "https://" + url
api_key = os.environ["WEAVIATE_API_KEY"]

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

obj = {
    "class": "DemoCollection",
    "properties": {
        "text": "Hello, Weaviate!"
    }
}

response = requests.post(f"{url}/v1/objects", headers=headers, json=obj, timeout=30)
print("Status:", response.status_code)
print("Response:", response.text)
