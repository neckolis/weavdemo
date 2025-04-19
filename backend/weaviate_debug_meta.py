import os
import requests
from dotenv import load_dotenv
import weaviate
from weaviate.classes.init import Auth

load_dotenv()

url = os.environ["WEAVIATE_URL"]
api_key = os.environ["WEAVIATE_API_KEY"]

print(f"[DEBUG] WEAVIATE_URL: {url}")
print(f"[DEBUG] API KEY (first 5 chars): {api_key[:5]}...\n")

# Direct HTTP GET to /v1/meta
headers = {"Authorization": f"Bearer {api_key}"}
meta_url = url.rstrip('/') + "/v1/meta"
print(f"[DEBUG] HTTP GET to: {meta_url}")
resp = requests.get(meta_url, headers=headers)
print("[DEBUG] HTTP Status:", resp.status_code)
print("[DEBUG] HTTP Body:", resp.text)

# Print weaviate-client version
try:
    import pkg_resources
    version = pkg_resources.get_distribution("weaviate-client").version
    print(f"[DEBUG] weaviate-client version: {version}")
except Exception as e:
    print(f"[DEBUG] Could not determine weaviate-client version: {e}")

# Try v4 client connection
host = url.replace("https://", "").replace("/", "")
grpc_host = f"grpc-{host}"
print(f"[DEBUG] connect_to_custom: http_host={host}, grpc_host={grpc_host}")
try:
    client = weaviate.connect_to_custom(
        http_host=host,
        http_port=443,
        http_secure=True,
        grpc_host=grpc_host,
        grpc_port=50051,
        grpc_secure=True,
        skip_init_checks=True,
        auth_credentials=Auth.api_key(api_key),
    )
    print("[DEBUG] v4 client connected. Listing collections...")
    collections = client.collections.list_all()
    print("[DEBUG] Collections:", collections)
    client.close()
except Exception as e:
    print("[DEBUG] v4 client error:", e)
