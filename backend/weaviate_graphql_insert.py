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

graphql_mutation = {
    "query": """
    mutation {
      addDemoCollection(
        objects: [
          { data: { text: \"Hello, Weaviate!\" } }
        ]
      ) {
        numberObjects
      }
    }
    """
}

response = requests.post(f"{url}/v1/graphql", headers=headers, json=graphql_mutation, timeout=30)
print("Status:", response.status_code)
try:
    print("Response:", response.json())
except Exception:
    print("Raw response:", response.text)
