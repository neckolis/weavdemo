import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import weaviate
from typing import List
import datetime
import traceback

print("Starting FastAPI app...")

load_dotenv()

WEAVIATE_URL = os.getenv("WEAVIATE_URL")
WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
                client.collections.create(
                    name=class_name,
                    properties=[
                        # Use dataType instead of data_type for Weaviate Python client v4
                        # dataType should be an array of strings
                        {"name": "filename", "dataType": ["text"]},
                        {"name": "content", "dataType": ["text"]},
                        {"name": "uploaded_at", "dataType": ["date"]}
                    ]
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
                uploaded_at = datetime.datetime.utcnow().isoformat()
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
        results = collection.query.near_text(
            query=query_text,
            limit=5  # Return top 5 most relevant documents
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
