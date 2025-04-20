import os
import weaviate
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# Print Python version
print(f"Python version: {sys.version}")

# Get Weaviate credentials from environment variables
WEAVIATE_URL = "https://kqugiutttssmltcdo7xnq.c0.us-west3.gcp.weaviate.cloud"
WEAVIATE_API_KEY = "7kr5d74yMRQzsUs9s0DtnxxbcEUwmoxuEJU5"

print("WEAVIATE_URL:", WEAVIATE_URL)
print("WEAVIATE_API_KEY:", WEAVIATE_API_KEY[:5] + "..." if WEAVIATE_API_KEY else None)

# Connect to Weaviate
client = weaviate.connect_to_wcs(
    cluster_url=WEAVIATE_URL,
    auth_credentials=weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY)
)

# Test collection name
class_name = "TestDocument"

# Delete the collection if it exists
if class_name in client.collections.list_all():
    print(f"Deleting existing collection {class_name}")
    client.collections.delete(class_name)

# Try different formats for creating collections

# Format 1: Using weaviate.DataType enum
print(f"Creating collection {class_name}_Format1 with weaviate.DataType enum")
try:
    client.collections.create(
        name=f"{class_name}_Format1",
        properties=[
            {"name": "filename", "data_type": weaviate.DataType.TEXT},
            {"name": "content", "data_type": weaviate.DataType.TEXT},
            {"name": "uploaded_at", "data_type": weaviate.DataType.DATE}
        ]
    )
    print(f"Collection {class_name}_Format1 created successfully")
except Exception as e:
    print(f"Error creating collection with Format1: {e}")

# Format 2: Using string values with data_type
print(f"Creating collection {class_name}_Format2 with string values and data_type")
try:
    client.collections.create(
        name=f"{class_name}_Format2",
        properties=[
            {"name": "filename", "data_type": ["text"]},
            {"name": "content", "data_type": ["text"]},
            {"name": "uploaded_at", "data_type": ["date"]}
        ]
    )
    print(f"Collection {class_name}_Format2 created successfully")
except Exception as e:
    print(f"Error creating collection with Format2: {e}")

# Format 3: Using string values with dataType
print(f"Creating collection {class_name}_Format3 with string values and dataType")
try:
    client.collections.create(
        name=f"{class_name}_Format3",
        properties=[
            {"name": "filename", "dataType": ["text"]},
            {"name": "content", "dataType": ["text"]},
            {"name": "uploaded_at", "dataType": ["date"]}
        ]
    )
    print(f"Collection {class_name}_Format3 created successfully")
except Exception as e:
    print(f"Error creating collection with Format3: {e}")

# List all collections
print("Available collections:", client.collections.list_all())
