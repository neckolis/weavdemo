import os
import json
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from dotenv import load_dotenv
import weaviate
from weaviate.classes.config import Property, DataType
from typing import List, Dict, Any
import datetime
import traceback

# Custom JSON encoder to handle datetime objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super().default(obj)

print("Starting FastAPI app...")

load_dotenv()

WEAVIATE_URL = os.getenv("WEAVIATE_URL")
WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_BASE = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now to fix CORS issues
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("In startup_event")
    print("WEAVIATE_URL:", os.getenv("WEAVIATE_URL"))
    print("WEAVIATE_API_KEY:", os.getenv("WEAVIATE_API_KEY"))
    global client
    client = weaviate.connect_to_wcs(
        cluster_url=WEAVIATE_URL,
        auth_credentials=weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY)
    )

    # Configure existing collections
    try:
        configure_existing_collections()
    except Exception as e:
        print(f"Error configuring existing collections: {e}")
        traceback.print_exc()

def configure_existing_collections():
    """Configure existing collections with proper vectorizer settings."""
    print("Checking and configuring existing collections...")
    collections = client.collections.list_all()
    print(f"Found collections: {collections}")

    if "Document" in collections:
        print("Configuring Document collection...")
        try:
            # Get the collection
            collection = client.collections.get("Document")

            # Check if vectorizer is configured
            config = collection.config.get()
            print(f"Current collection config: {config}")

            # Update vectorizer if needed
            if not config.vectorizer or config.vectorizer == "none":
                print("Setting vectorizer for Document collection...")
                try:
                    collection.config.update_vectorizer(
                        vectorizer=weaviate.classes.config.Configure.Vectorizer.text2vec_transformers()
                    )
                    print("Vectorizer updated successfully")
                except Exception as vectorizer_error:
                    print(f"Error updating vectorizer: {vectorizer_error}")

                    # Try alternative vectorizer
                    try:
                        print("Trying alternative vectorizer...")
                        collection.config.update_vectorizer(
                            vectorizer=weaviate.classes.config.Configure.Vectorizer.none()
                        )
                        print("Set to 'none' vectorizer successfully")
                    except Exception as alt_error:
                        print(f"Error setting alternative vectorizer: {alt_error}")
        except Exception as e:
            print(f"Error configuring Document collection: {e}")
            traceback.print_exc()
    else:
        print("Document collection does not exist, will be created when files are uploaded")

@app.get("/ping")
def ping():
    try:
        meta = client.get_meta()
        return {"status": "ok", "meta": meta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/debug/env")
def debug_env():
    # Return masked environment variables for debugging
    return {
        "DEEPSEEK_API_KEY_SET": bool(DEEPSEEK_API_KEY),
        "DEEPSEEK_API_BASE": DEEPSEEK_API_BASE,
        "DEEPSEEK_MODEL": DEEPSEEK_MODEL,
        "WEAVIATE_URL_SET": bool(WEAVIATE_URL),
        "WEAVIATE_API_KEY_SET": bool(WEAVIATE_API_KEY)
    }

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    try:
        print("Upload endpoint called with files:", [f.filename for f in files])
        results = []
        # Ensure Document class exists
        class_name = "Document"
        try:
            collections = client.collections.list_all()
            print("Available collections:", collections)

            if class_name not in collections:
                print(f"Creating collection {class_name}")
                # Define properties using the Property class with DataType enum
                properties = [
                    Property(name="filename", data_type=DataType.TEXT),
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="uploaded_at", data_type=DataType.DATE)
                ]

                # Create the collection with the proper property format and vectorizer
                try:
                    print("Creating collection with text2vec_transformers vectorizer...")
                    client.collections.create(
                        name=class_name,
                        properties=properties,
                        vectorizer_config=weaviate.classes.config.Configure.Vectorizer.text2vec_transformers()
                    )
                    print("Collection created successfully with text2vec_transformers")
                except Exception as vectorizer_error:
                    print(f"Error creating collection with text2vec_transformers: {vectorizer_error}")

                    # Try with a different vectorizer
                    try:
                        print("Creating collection with 'none' vectorizer...")
                        client.collections.create(
                            name=class_name,
                            properties=properties,
                            vectorizer_config=weaviate.classes.config.Configure.Vectorizer.none()
                        )
                        print("Collection created successfully with 'none' vectorizer")
                    except Exception as none_error:
                        print(f"Error creating collection with 'none' vectorizer: {none_error}")
                        raise
                print(f"Collection {class_name} created successfully")
        except Exception as collection_error:
            print(f"Error creating/checking collection: {collection_error}")
            traceback.print_exc()
            return JSONResponse({"error": f"Collection error: {str(collection_error)}"}, status_code=500)

        for file in files:
            try:
                raw = await file.read()
                filename = file.filename
                uploaded_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
                print(f"Processing file: {filename}, size: {len(raw)} bytes")

                # Extract plain text from file
                try:
                    # Simple text extraction based on file extension
                    if filename.lower().endswith('.txt'):
                        text = raw.decode(errors="ignore")
                    else:
                        # For other file types, just use the raw content as text
                        text = raw.decode(errors="ignore")
                except Exception as text_error:
                    print(f"Text extraction error for {filename}: {text_error}")
                    text = "[Unable to extract text from this file]"

                # Prepare object for Weaviate
                obj = {
                    "filename": filename,
                    "content": text,
                    "uploaded_at": uploaded_at
                }

                # Insert into Weaviate
                print(f"Inserting {filename} into Weaviate")
                collection = client.collections.get("Document")
                collection.data.insert(obj)
                print(f"Successfully inserted {filename}")

                results.append({"filename": filename, "status": "uploaded"})
            except Exception as file_error:
                print(f"Error processing file {file.filename}: {file_error}")
                traceback.print_exc()
                results.append({"filename": file.filename, "status": "error", "error": str(file_error)})

        return JSONResponse({"results": results})
    except Exception as e:
        print("UPLOAD ERROR:", e)
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/search")
async def search_documents(query: dict):
    try:
        # Get the query string from the request body
        query_text = query.get("query", "")
        print(f"\n\n=== SEARCH REQUEST ===\nQuery: {query_text}")

        if not query_text:
            print("Error: Query is empty")
            return JSONResponse({"error": "Query is required"}, status_code=400)

        # Check if Document collection exists
        collections = client.collections.list_all()
        print(f"Available collections: {collections}")

        if "Document" not in collections:
            print("Error: Document collection does not exist")
            return JSONResponse({"error": "Document collection does not exist"}, status_code=500)

        # Get collection info
        collection = client.collections.get("Document")
        config = collection.config.get()
        print(f"Collection config: {config}")

        # Check if there are any objects in the collection
        try:
            count = collection.query.fetch_objects(limit=1)
            print(f"Collection has objects: {len(count.objects) > 0}")
            if len(count.objects) > 0:
                print(f"Sample object: {count.objects[0].properties}")
        except Exception as count_error:
            print(f"Error counting objects: {count_error}")

        # Try different search methods
        results = None

        # Try using hybrid search first (combines vector and keyword search)
        try:
            print("Attempting hybrid search...")
            results = collection.query.hybrid(
                query=query_text,
                alpha=0.5,  # Balance between vector and keyword search
                limit=5
            )
            print("Hybrid search successful")
        except Exception as hybrid_error:
            print(f"Hybrid search failed: {hybrid_error}")

            # Try using BM25 search if hybrid search fails
            try:
                print("Attempting BM25 search...")
                results = collection.query.bm25(
                    query=query_text,
                    query_properties=["content"],
                    limit=5
                )
                print("BM25 search successful")
            except Exception as bm25_error:
                print(f"BM25 search failed: {bm25_error}")

                # Try using get_all as a last resort
                try:
                    print("Attempting to get all objects...")
                    results = collection.query.fetch_objects(limit=5)
                    print("Get all objects successful")
                except Exception as get_error:
                    print(f"Get all objects failed: {get_error}")
                    raise Exception("All search methods failed")

        # Format the results
        formatted_results = []
        if results and hasattr(results, 'objects') and results.objects:
            print(f"Found {len(results.objects)} results")
            for obj in results.objects:
                try:
                    # Check if the object has the required properties
                    if not hasattr(obj, 'properties'):
                        print(f"Object has no properties: {obj}")
                        continue

                    # Get the properties safely
                    props = obj.properties
                    filename = props.get("filename", "Unknown filename")
                    content = props.get("content", "No content available")

                    # Handle uploaded_at datetime properly
                    uploaded_at = props.get("uploaded_at")
                    if uploaded_at is None:
                        uploaded_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    elif isinstance(uploaded_at, datetime.datetime):
                        uploaded_at = uploaded_at.isoformat()
                    elif not isinstance(uploaded_at, str):
                        uploaded_at = str(uploaded_at)

                    formatted_results.append({
                        "filename": filename,
                        "content": content,
                        "uploaded_at": uploaded_at
                    })
                    print(f"Added result: {filename}")
                except Exception as format_error:
                    print(f"Error formatting result: {format_error}")
                    traceback.print_exc()
        else:
            print("No results found or results object is invalid")

        print(f"Returning {len(formatted_results)} formatted results")
        # Use the custom JSON encoder to handle datetime objects
        json_compatible_results = json.dumps({"results": formatted_results}, cls=CustomJSONEncoder)
        return JSONResponse(content=json.loads(json_compatible_results))
    except Exception as e:
        print("SEARCH ERROR:", e)
        traceback.print_exc()
        error_json = json.dumps({"error": str(e)}, cls=CustomJSONEncoder)
        return JSONResponse(content=json.loads(error_json), status_code=500)

@app.post("/chat")
async def chat_completion(request: Request):
    try:
        # Print environment variables for debugging (masked for security)
        print("DEEPSEEK_API_KEY set:", bool(DEEPSEEK_API_KEY))
        print("DEEPSEEK_API_BASE:", DEEPSEEK_API_BASE)
        print("DEEPSEEK_MODEL:", DEEPSEEK_MODEL)

        # Check if DeepSeek API key is configured
        if not DEEPSEEK_API_KEY:
            print("ERROR: DeepSeek API key is not configured on the server")
            return JSONResponse({"error": "DeepSeek API key is not configured on the server"}, status_code=500)

        # Get the request body
        body = await request.json()
        print("Chat request body:", json.dumps(body))

        # Forward the request to DeepSeek API
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        # Set the model if not provided
        if "model" not in body:
            body["model"] = DEEPSEEK_MODEL
            print("Using model:", body["model"])

        # Make the request to DeepSeek API
        print(f"Sending request to {DEEPSEEK_API_BASE}/chat/completions")
        response = requests.post(
            f"{DEEPSEEK_API_BASE}/chat/completions",
            headers=headers,
            json=body,
            timeout=60
        )

        print("DeepSeek API response status:", response.status_code)

        # Return the response from DeepSeek API
        response_json = response.json()
        print("DeepSeek API response:", json.dumps(response_json))
        return JSONResponse(response_json, status_code=response.status_code)
    except Exception as e:
        print("CHAT ERROR:", e)
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)