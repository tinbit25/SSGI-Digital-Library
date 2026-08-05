# Qdrant Infrastructure Setup Requirements

## Docker Requirement
The RAG pipeline requires the Qdrant vector database to store and retrieve document embeddings. 
Docker is **NOT INSTALLED** on this machine, meaning Qdrant cannot be automatically initialized.

## Installation Steps
1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/).
2. Ensure Docker Desktop is running.
3. Open PowerShell or Command Prompt.

## Qdrant Startup Command
Once Docker is installed, pull and run the Qdrant container with the following command:

```bash
docker run -d -p 6333:6333 -p 6334:6334 \
  -v qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

## Verification
Verify that Qdrant is running and responding by calling:

```bash
curl http://localhost:6333/collections
```
You should receive a JSON response similar to: `{"result": {"collections": []}, "status": "ok", "time": 0.00...}`

After completing this setup, the Laravel backend `ProcessDocumentJob` will successfully be able to vectorize uploaded PDFs.
