# SSGI Digital Library Portal — Backend API

## 🛠️ Requirements & Setup
- **PHP** >= 8.2 (tested on 8.5)
- **Composer** >= 2.0
- **Database**: MySQL 8.x (`ssgi_digital_library`)
- **Docker** (optional) for Qdrant and queue workers

### 1️⃣ Install dependencies
```bash
composer install
```

### 2️⃣ Environment configuration
```bash
cp .env.example .env
php artisan key:generate
```
Edit `.env` and set the following variables:
```ini
APP_NAME="SSGI Digital Library Portal"
APP_ENV=local
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ssgi_digital_library
DB_USERNAME=root
DB_PASSWORD=

# Qdrant vector store
QDRANT_HOST=http://localhost:6333
QDRANT_API_KEY=

# Large Language Model endpoint (self‑hosted or API)
LLM_ENDPOINT=http://localhost:8001/v1/chat/completions
LLM_API_KEY=
```

### 3️⃣ Database migration & seeding
```bash
php artisan migrate --seed
```

### 4️⃣ Queue driver (recommended)
- **Redis** (best for production) – set `QUEUE_CONNECTION=redis` in `.env`
- **Database** (fallback) – set `QUEUE_CONNECTION=database`
Start the queue worker:
```bash
php artisan queue:work
```

### 5️⃣ Run the server
```bash
php artisan serve
```
API base URL: `http://localhost:8000/api`

---

## 📚 API Overview
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | – | Register a new user |
| POST | `/api/login` | – | Login and receive Sanctum token |
| POST | `/api/logout` | ✅ (sanctum) | Revoke token |
| GET | `/api/health` | – | Health check |
| **Resources** |
| GET | `/api/categories` | – | List categories |
| GET | `/api/resources` | – | List public resources |
| GET | `/api/resources/{id}` | – | View resource details |
| POST | `/api/resources` | ✅ (Librarian/Administrator) | Upload new resource |
| PUT | `/api/resources/{id}` | ✅ (Librarian/Administrator) | Update resource |
| DELETE | `/api/resources/{id}` | ✅ (Administrator) | Delete resource |
| **Feedback** |
| POST | `/api/feedback` | ✅ (any user) | Submit feedback |
| GET | `/api/feedback` | ✅ (Administrator/Librarian) | List feedback |
| PUT | `/api/feedback/{id}` | ✅ (Administrator/Librarian) | Update status |
| **Notifications** |
| GET | `/api/notifications` | ✅ (Librarian/Administrator) | List notifications |
| PUT | `/api/notifications/{id}/read` | ✅ (Librarian/Administrator) | Mark as read |
| **Search** |
| GET | `/api/search?q=…` | – (guest allowed) | Full‑text search over resources |
| **AI Assistant (RAG)** |
| POST | `/api/ai/chat` | – (guest allowed) | Question answering via Retrieval‑Augmented Generation |

---

## 🤖 RAG Architecture
```
Client (frontend) → POST /api/ai/chat
    │
    ▼
AIService (Laravel Service)
    │   1️⃣ Generate embedding (EmbeddingService → Python script)
    │   2️⃣ Semantic search (SemanticSearchService → Qdrant vector DB)
    │   3️⃣ Build context from matching ResourceChunk records
    │   4️⃣ Prompt LLM (HTTP request to configured LLM endpoint)
    │   5️⃣ Persist chat (AiChatHistory model)
    ▼
Response → Client
```
All heavy work runs asynchronously where possible (embedding and Qdrant queries are fast; long‑running LLM calls can be queued in the future).

---

## ✅ Security Checklist
- No public PDF URLs – PDFs are served via authenticated `GET /resources/{id}` with proper authorization checks.
- All write endpoints protected by Sanctum and role‑based middleware.
- Input validation via Form Requests (e.g., `StoreResourceRequest`, `StoreFeedbackRequest`).
- Exceptions sanitized – generic error messages returned to clients.
- Files stored outside web root (`storage/app/public`) and accessed through streamed responses.

---

## 🧪 Testing
Run the suite:
```bash
php artisan test
```
Test coverage includes:
- Authentication (register, login, token revocation)
- Resource CRUD + PDF permission checks
- Search endpoint (guest access, filters)
- Feedback workflow & status transitions
- Notification creation & read handling
- RAG processing (embedding, Qdrant lookup, LLM call mock)
- AI chat endpoint (history persistence, error handling)

---

## 📦 Frontend Integration
1. **Base URL** – configure the frontend to call `http://localhost:8000/api`.
2. **Authentication** – use Laravel Sanctum SPA guard; send `X-XSRF-TOKEN` cookie or bearer token.
3. **Search** – hit `/api/search?q=term` and display paginated results.
4. **AI Chat** – POST `{question}` to `/api/ai/chat`; show answer and store conversation locally if desired.
5. **Notifications** – poll `/api/notifications` or use Laravel Echo (optional) for real‑time updates.

---

## 📄 License
MIT License
