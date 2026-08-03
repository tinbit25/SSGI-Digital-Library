# Database Documentation — SSGI Digital Library

## Overview
This document describes the database schema used in the SSGI Digital Library system.

## Database: MySQL
**Database Name:** `ssgi_digital_library`

---

## Tables

### `users`
Stores registered library users and administrators.

| Column       | Type         | Constraints         | Description            |
|--------------|--------------|---------------------|------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT  | Unique user ID         |
| name         | VARCHAR(255) | NOT NULL            | Full name              |
| email        | VARCHAR(255) | UNIQUE, NOT NULL    | Email address          |
| password     | VARCHAR(255) | NOT NULL            | Hashed password        |
| role         | ENUM         | DEFAULT 'student'   | student / librarian / admin |
| created_at   | TIMESTAMP    |                     | Record creation time   |
| updated_at   | TIMESTAMP    |                     | Record update time     |

---

### `books`
Stores library book catalog.

| Column       | Type         | Constraints         | Description            |
|--------------|--------------|---------------------|------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT  | Unique book ID         |
| title        | VARCHAR(255) | NOT NULL            | Book title             |
| author       | VARCHAR(255) | NOT NULL            | Author name            |
| isbn         | VARCHAR(20)  | UNIQUE              | ISBN number            |
| category     | VARCHAR(100) |                     | Book category          |
| quantity     | INT          | DEFAULT 1           | Total copies           |
| available    | INT          | DEFAULT 1           | Available copies       |
| created_at   | TIMESTAMP    |                     | Record creation time   |
| updated_at   | TIMESTAMP    |                     | Record update time     |

---

### `borrows`
Tracks book borrowing and return transactions.

| Column       | Type         | Constraints         | Description            |
|--------------|--------------|---------------------|------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT  | Unique borrow ID       |
| user_id      | BIGINT       | FK → users.id       | Borrower               |
| book_id      | BIGINT       | FK → books.id       | Borrowed book          |
| borrowed_at  | TIMESTAMP    | NOT NULL            | Borrow date            |
| due_at       | TIMESTAMP    | NOT NULL            | Due date               |
| returned_at  | TIMESTAMP    | NULLABLE            | Return date            |
| status       | ENUM         | DEFAULT 'borrowed'  | borrowed / returned / overdue |

---

## Relationships

- A **User** can borrow many **Books** (one-to-many via `borrows`)
- A **Book** can be borrowed by many **Users** (one-to-many via `borrows`)
