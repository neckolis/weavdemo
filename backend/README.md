# Backend for Weaviate Demo

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Copy `.env` and set your Weaviate URL and API key.
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## Endpoints
- `/ping`: Checks connection to Weaviate.
