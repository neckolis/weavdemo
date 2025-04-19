import os
import weaviate
from weaviate.classes.init import Auth
from dotenv import load_dotenv

load_dotenv()

url = os.environ["WEAVIATE_URL"]
api_key = os.environ["WEAVIATE_API_KEY"]

host = url.replace("https://", "").replace("/", "")
grpc_host = f"grpc-{host}"

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
    print("[SUCCESS] Connected to Weaviate!")
    print("[INFO] Cluster version:", client.get_meta()["version"])
    collections = client.collections.list_all()
    print("[INFO] Collections:", collections)
    client.close()
except Exception as e:
    print("[ERROR] Could not connect:", e)
