# 📚 SSGI Digital Library

A full-stack digital library management system built with Laravel (backend) and React (frontend).

## 📁 Project Structure

```
SSGI-Digital-Library/
│
├── backend/          # Laravel REST API
├── frontend/         # React application
├── database/
│   ├── ERD/          # Entity Relationship Diagrams
│   ├── database-documentation.md
│   └── sample-data.sql
├── docs/
│   ├── SRS.pdf       # Software Requirements Specification
│   └── API-documentation.md
└── README.md
```

## 🚀 Getting Started

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

## 🛠️ Tech Stack

| Layer     | Technology        |
|-----------|-------------------|
| Frontend  | React.js          |
| Backend   | Laravel (PHP)     |
| Database  | MySQL             |
| API Style | RESTful           |

## 📄 Documentation

- [API Documentation](./docs/API-documentation.md)
- [Database Documentation](./database/database-documentation.md)

## 👥 Team

SSGI Digital Library Project Team

