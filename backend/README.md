# SSGI Digital Library Portal — Backend API

Backend REST API for the SSGI Digital Library Portal built with Laravel 12.

## 🛠️ Requirements & Setup

- **PHP**: >= 8.2 (Tested on 8.5)
- **Composer**: >= 2.0
- **Database**: MySQL 8.x (`ssgi_digital_library`)

---

## 🚀 Setup Steps

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` (or update existing `.env`):
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Setup**
   Ensure MySQL server is running and database `ssgi_digital_library` is created.

4. **Run Local Server**
   ```bash
   php artisan serve
   ```
   API URL: `http://localhost:8000/api`

---

## 🔑 Required Environment Variables

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

QDRANT_HOST=http://localhost:6333
QDRANT_API_KEY=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
```

---

## 📂 Architecture Overview

```
app/
├── Http/
│   └── Controllers/
│       └── API/           # REST API Controllers
├── Services/              # Core Business Logic
├── Repositories/          # Data Access Layer
├── Jobs/                  # Queue Workers (PDF, AI, Email)
└── Models/                # Eloquent Models
```

---

## 🌐 Baseline Verification

Test API Health:
```bash
curl http://localhost:8000/api/health
```
