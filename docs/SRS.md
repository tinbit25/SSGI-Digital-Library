# Software Requirements Specification (SRS)
## SSGI Digital Library System

**Version:** 1.0  
**Date:** August 2026  
**Prepared by:** SSGI Project Team  

---

## 1. Introduction

### 1.1 Purpose
This document describes the software requirements for the SSGI Digital Library System — a web-based application to manage library books, users, and borrowing operations.

### 1.2 Scope
The system allows students to browse and borrow books, and librarians/admins to manage the catalog, users, and transactions.

### 1.3 Definitions
| Term       | Definition                                      |
|------------|-------------------------------------------------|
| SRS        | Software Requirements Specification             |
| Admin      | Super user with full system access              |
| Librarian  | Staff who manage books and borrowing            |
| Student    | End user who browses and borrows books          |

---

## 2. Overall Description

### 2.1 System Overview
A full-stack web application with:
- **Frontend:** React.js (SPA)
- **Backend:** Laravel REST API
- **Database:** MySQL

### 2.2 User Roles
- **Admin** — full control (users, books, reports)
- **Librarian** — manage books, approve borrows, manage returns
- **Student** — browse catalog, borrow/return books, view history

---

## 3. Functional Requirements

### 3.1 Authentication
- FR-01: Users shall be able to register with name, email, and password
- FR-02: Users shall be able to log in and receive an access token
- FR-03: Users shall be able to log out

### 3.2 Book Management
- FR-04: Admins/Librarians shall be able to add new books
- FR-05: Admins/Librarians shall be able to edit book details
- FR-06: Admins/Librarians shall be able to delete books
- FR-07: All users shall be able to search and browse the book catalog

### 3.3 Borrowing System
- FR-08: Students shall be able to borrow available books
- FR-09: Students shall be able to return borrowed books
- FR-10: The system shall enforce a 14-day borrowing period
- FR-11: The system shall track overdue books

### 3.4 User Management
- FR-12: Admins shall be able to view, edit, and deactivate users
- FR-13: Admins shall be able to assign roles to users

---

## 4. Non-Functional Requirements

| ID    | Requirement                          | Target              |
|-------|--------------------------------------|---------------------|
| NFR-01 | Performance — page load time        | < 3 seconds         |
| NFR-02 | Availability                         | 99% uptime          |
| NFR-03 | Security — passwords hashed         | bcrypt              |
| NFR-04 | Responsive UI (mobile + desktop)    | All screen sizes    |
| NFR-05 | API response time                    | < 500ms             |

---

## 5. System Constraints
- PHP >= 8.1 required for Laravel backend
- Node.js >= 18 required for React frontend
- MySQL >= 8.0 required for database

---

## 6. Appendix
- See `database/database-documentation.md` for schema details
- See `docs/API-documentation.md` for API endpoints
