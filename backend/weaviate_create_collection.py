import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Make sure the URL has https:// prefix
url = os.environ["WEAVIATE_URL"]
if not url.startswith("http"):
    url = "https://" + url
api_key = os.environ["WEAVIATE_API_KEY"]

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

collection_schema = {
    "name": "DemoCollection",
    "description": "A demo collection for testing",
    "properties": [
        {
            "name": "text",
            "dataType": "text",
            "description": "A text property"
        }
    ]
}

try:
    response = requests.post(f"{url}/v1/collections", headers=headers, json=collection_schema, timeout=60)
    print("Status:", response.status_code)
    try:
        print("Response:", response.json())
    except Exception:
        print("Raw response:", response.text)
except requests.exceptions.RequestException as e:
    print("Request failed:", str(e))
