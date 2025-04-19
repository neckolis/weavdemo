import os
import weaviate
from weaviate.classes.init import Auth
from dotenv import load_dotenv

load_dotenv()

# Parse the host from your WEAVIATE_URL (strip 'https://' and any trailing '/')
host = os.environ["WEAVIATE_URL"].replace("https://", "").replace("/", "")
api_key = os.environ["WEAVIATE_API_KEY"]

grpc_host = f"grpc-{host}"

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

try:
    collections = client.collections.list_all()
    print("Connection successful. Collections:", collections)
finally:
    client.close()
