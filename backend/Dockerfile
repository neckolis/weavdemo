FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for docling and weaviate-client (if needed)
RUN apt-get update && \
    apt-get install -y build-essential libmagic1 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default port - can be overridden with environment variable
ENV PORT=8000
EXPOSE ${PORT}

# Use environment variable for port to make it configurable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
