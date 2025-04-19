import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import weaviate
from typing import List
import datetime
import docling
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
        results = []
        # Ensure Document class exists
        class_name = "Document"
        if class_name not in client.collections.list_all():
            client.collections.create(
                name=class_name,
                properties=[
                    {"name": "filename", "dataType": "text"},
                    {"name": "content", "dataType": "text"},
                    {"name": "uploaded_at", "dataType": "date"}
                ]
            )
        for file in files:
            raw = await file.read()
            filename = file.filename
            uploaded_at = datetime.datetime.utcnow().isoformat()
            # Use docling to extract plain text from file
            try:
                text = docling.read(raw, filename=filename)
            except Exception:
                text = raw.decode(errors="ignore")  # fallback
            obj = {
                "filename": filename,
                "content": text,
                "uploaded_at": uploaded_at
            }
            client.collections.get("Document").data.insert(obj)
            results.append({"filename": filename, "status": "uploaded"})
        return JSONResponse({"results": results})
    except Exception as e:
        print("UPLOAD ERROR:", e)
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# Trivial change for redeployment
