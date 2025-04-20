import weaviate
import sys

# Print Python version
print(f"Python version: {sys.version}")

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

# List all collections
collections = client.collections.list_all()
print("Available collections:", collections)

# Inspect the existing collection
if 'Pdfchunk' in collections:
    collection = client.collections.get('Pdfchunk')
    print("\nInspecting Pdfchunk collection:")
    print("Collection config:", collection.config)

    # Print collection properties
    print("\nCollection properties:")
    for prop in collection.config.properties:
        print(f"Property: {prop.name}, Data Type: {prop.data_type}, Type: {type(prop.data_type)}")
        print(f"All attributes: {dir(prop)}")
        print(f"Property dict: {prop.__dict__}")
        print()

    # Try different formats for creating a collection
    print("\nTrying to create a test collection with different formats...")

    # Format 1: Using text enum
    try:
        client.collections.create(
            name="TestCollection1",
            properties=[
                {
                    "name": "test_prop",
                    "dataType": ["text"]
                }
            ]
        )
        print("Test collection 1 created successfully!")
    except Exception as e:
        print(f"Error creating test collection 1: {e}")

    # Format 2: Using text string
    try:
        from weaviate.classes.config import DataType
        client.collections.create(
            name="TestCollection2",
            properties=[
                {
                    "name": "test_prop",
                    "data_type": DataType.TEXT
                }
            ]
        )
        print("Test collection 2 created successfully!")
    except Exception as e:
        print(f"Error creating test collection 2: {e}")

    # Clean up
    for name in ["TestCollection1", "TestCollection2"]:
        if name in client.collections.list_all():
            client.collections.delete(name)
            print(f"{name} deleted.")

# Close the connection
client.close()
