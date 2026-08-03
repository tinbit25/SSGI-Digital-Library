# SSGI Digital Library — API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## Endpoints

### 🔐 Auth
| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| POST   | /auth/register   | Register new user |
| POST   | /auth/login      | Login             |
| POST   | /auth/logout     | Logout            |

### 📚 Books
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | /books           | List all books      |
| GET    | /books/{id}      | Get a single book   |
| POST   | /books           | Add a new book      |
| PUT    | /books/{id}      | Update a book       |
| DELETE | /books/{id}      | Delete a book       |

### 👤 Users
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | /users           | List all users      |
| GET    | /users/{id}      | Get a single user   |
| PUT    | /users/{id}      | Update user info    |

### 📋 Borrowing
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| POST   | /borrow              | Borrow a book          |
| POST   | /return/{borrow_id}  | Return a book          |
| GET    | /borrow/history      | View borrow history    |
