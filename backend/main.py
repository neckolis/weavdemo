import os
import json
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import weaviate
from weaviate.classes.config import Property, DataType
from typing import List, Dict, Any
import datetime
import traceback

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
                client.collections.create(
                    name=class_name,
                    properties=properties,
                    vectorizer_config=weaviate.classes.config.Configure.Vectorizer.text2vec_transformers()
                )
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
        if not query_text:
            return JSONResponse({"error": "Query is required"}, status_code=400)

        # Search for documents in Weaviate
        collection = client.collections.get("Document")
        try:
            # Try using near_text search first
            results = collection.query.near_text(
                query=query_text,
                limit=5  # Return top 5 most relevant documents
            )
        except Exception as search_error:
            print(f"near_text search failed: {search_error}")
            # Fall back to BM25 search if near_text fails
            results = collection.query.bm25(
                query=query_text,
                properties=["content"],
                limit=5
            )

        # Format the results
        formatted_results = []
        for obj in results.objects:
            formatted_results.append({
                "filename": obj.properties["filename"],
                "content": obj.properties["content"],
                "uploaded_at": obj.properties["uploaded_at"]
            })

        return JSONResponse({"results": formatted_results})
    except Exception as e:
        print("SEARCH ERROR:", e)
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

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