import weaviate
import sys
import uuid
import random
import string

# Print Python version
print(f"Python version: {sys.version}")
print(f"Weaviate client version: {weaviate.__version__}")

# Weaviate credentials
WEAVIATE_URL = "https://kqugiutttssmltcdo7xnq.c0.us-west3.gcp.weaviate.cloud"
WEAVIATE_API_KEY = "7kr5d74yMRQzsUs9s0DtnxxbcEUwmoxuEJU5"

print("WEAVIATE_URL:", WEAVIATE_URL)
print("WEAVIATE_API_KEY:", WEAVIATE_API_KEY[:5] + "..." if WEAVIATE_API_KEY else None)

# Connect to Weaviate
client = weaviate.connect_to_wcs(
    cluster_url=WEAVIATE_URL,
    auth_credentials=weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY)
)

# Generate a random string for unique collection names
def random_string(length=5):
    return ''.join(random.choice(string.ascii_uppercase) for _ in range(length))

# Test collection name with unique ID to avoid conflicts
test_id = random_string()
class_name = f"TestDoc{test_id}"

print(f"\nCreating test collection: {class_name}")

# Try different formats for creating a collection
formats = [
    {
        "name": "Format1",
        "properties": [
            {"name": "prop1", "dataType": ["text"]}
        ]
    },
    {
        "name": "Format2",
        "properties": [
            {"name": "prop1", "data_type": "text"}
        ]
    },
    {
        "name": "Format3",
        "properties": [
            {"name": "prop1", "data_type": ["text"]}
        ]
    },
    {
        "name": "Format4",
        "properties": [
            {"name": "prop1", "dataType": "text"}
        ]
    }
]

# Try each format
for i, format_config in enumerate(formats):
    try:
        test_class_name = f"{class_name}_{i+1}"
        print(f"\nTrying format {i+1} with class name {test_class_name}:")
        print(format_config)

        client.collections.create(
            name=test_class_name,
            properties=format_config["properties"]
        )
        print(f"✅ Success! Collection {test_class_name} created with format {i+1}")

        # Clean up
        client.collections.delete(test_class_name)
        print(f"Collection {test_class_name} deleted")
    except Exception as e:
        print(f"❌ Error with format {i+1}: {e}")

# Try creating a document collection with the format that works
try:
    doc_class_name = f"Document_{test_id}"
    print(f"\nCreating Document collection {doc_class_name} with the working format")

    # Use the format that worked in the previous tests
    client.collections.create(
        name=doc_class_name,
        properties=[
            {"name": "filename", "dataType": ["text"]},
            {"name": "content", "dataType": ["text"]},
            {"name": "uploaded_at", "dataType": ["date"]}
        ]
    )
    print(f"✅ Success! Document collection {doc_class_name} created")

    # Test inserting a document
    obj = {
        "filename": "test.txt",
        "content": "This is a test document",
        "uploaded_at": "2025-04-20T00:00:00Z"
    }

    collection = client.collections.get(doc_class_name)
    collection.data.insert(obj)
    print("✅ Successfully inserted a document")

    # Clean up
    client.collections.delete(doc_class_name)
    print(f"Collection {doc_class_name} deleted")
except Exception as e:
    print(f"❌ Error creating Document collection: {e}")

# Close the connection
client.close()
print("Connection closed")
