import os
import weaviate
from weaviate.classes.init import Auth
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

try:
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
    )
    # Instead of is_ready() or get_meta(), try to list the schema
    schema = client.collections.list_all()
    print("Connection successful. Collections:", schema)
except Exception as e:
    print("Connection failed:", str(e))
