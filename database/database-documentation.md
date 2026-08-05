# SSGI Digital Library Portal — Database Architecture & Technical Documentation
**Project:** Ethiopian Space Science and Geospatial Institute (SSGI) Digital Library Portal  
**Target Database Engine:** MySQL 8.0+ / InnoDB (with Qdrant Vector Database Integration)  
**Backend Framework Support:** Laravel 12 (Eloquent ORM)  
**Document Version:** 1.0 (Production Master Package)

---

## 1. System Context & Architectural Objectives
The **SSGI Digital Library Portal** is an enterprise, web-based digital resource repository built for the Ethiopian Space Science and Geospatial Institute. It provides centralized, secure online access to institutional scientific literature, technical satellite engineering manuals, geospatial training workbooks, and academic research papers.

### Critical System Rules & Compliance Highlights:
1. **Strictly Read-Only Access:** All document access is mediated online through a protected streaming PDF viewer. Users **cannot** download documents, directly access PDF files via URLs, or print protected digital assets.
2. **Hybrid AI RAG Architecture:** To support an advanced AI Library Assistant powered by Retrieval-Augmented Generation (RAG), the system operates a hybrid data layer:
   * **MySQL (InnoDB):** Stores structured metadata, users, taxonomy categories, feedback tickets, read audit logs, authoritative extracted plaintext chunks, and physical page references for reader navigation.
   * **Qdrant Vector Database:** Manages high-dimensional semantic vector embeddings (e.g., 1,536-dimensional arrays). Embeddings are **never** stored in MySQL; instead, MySQL stores unique pointers (`vector_id`) bridging relational chunks directly to Qdrant points.
3. **Out-of-Scope Exclusion:** The system strictly excludes physical library workflows such as QR code book borrowing, physical book return tracking, fine/penalty calculations, person-to-person direct messaging, and real-time chat rooms. Support inquiries are managed asynchronously via structured feedback tickets.

---

## 2. Global Design & Conventions
* **Storage Engine:** All MySQL tables employ **InnoDB**, ensuring ACID transaction compliance, row-level locking, and robust cascading referential integrity.
* **Character Encoding:** Engineered with **`utf8mb4`** character set and **`utf8mb4_unicode_ci`** collation to natively process multilingual Ethiopic scripts (Amharic), complex mathematical formulas, and scientific notations without character corruption.
* **Primary Keys:** Standardized on `BIGINT UNSIGNED AUTO_INCREMENT` for high-throughput scalability and strict Laravel 12 Eloquent migration alignment.
* **Timestamps:** Standard automated `created_at` and `updated_at` timestamps are embedded across operational entities. Non-destructive archiving is enabled via Eloquent Soft Deletes (`deleted_at`).

---

## 3. Comprehensive Table Specifications

### 3.1 `roles`
* **Purpose:** Defines User authorization tiers and permission boundaries in strict compatibility with Spatie Permission packages in Laravel.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique role ID |
  | `name` | `VARCHAR(50)` | `NOT NULL` | Role tier designation (`Administrator`, `Librarian`, `Staff`, `Guest`) |
  | `guard_name` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'web'` | Authentication guard name for Laravel RBAC middleware |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Record modification timestamp |
* **Relationships:** Has Many `users` (One-to-Many).
* **Indexes:** Unique composite index on `(name, guard_name)`, simple index on `name`.

---

### 3.2 `users`
* **Purpose:** Stores registered institutional user accounts and authentication credentials.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique account ID |
  | `role_id` | `BIGINT UNSIGNED` | `NOT NULL` | Foreign key referencing `roles.id` |
  | `name` | `VARCHAR(255)` | `NOT NULL` | User full name and title |
  | `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Unique institutional email (`@ssgi.gov.et`) |
  | `email_verified_at`| `TIMESTAMP` | `NULL, DEFAULT NULL` | Email verification timestamp |
  | `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt or Argon2 password hash |
  | `remember_token` | `VARCHAR(100)` | `NULL, DEFAULT NULL` | Laravel session persistent token |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Registration timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Profile modification timestamp |
  | `deleted_at` | `TIMESTAMP` | `NULL, DEFAULT NULL` | Soft delete timestamp for archiving accounts |
* **Relationships:** Belongs to `roles`; Has Many `resources` (uploaded), `access_logs`, `feedback`, `notifications`, and `ai_chat_history`; Belongs To Many `notifications` via pivot.
* **Indexes:** Unique on `email`, Foreign key index on `role_id`, simple indexes on `created_at` and `deleted_at`.

---

### 3.3 `categories`
* **Purpose:** Organizes digital books, datasets, and training manuals into a self-referential hierarchical taxonomy (e.g., GIS, Remote Sensing, Satellite Technology).
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique category ID |
  | `parent_id` | `BIGINT UNSIGNED` | `NULL, DEFAULT NULL` | Self-referential FK pointing to `categories.id` |
  | `name` | `VARCHAR(150)` | `NOT NULL` | Category domain title |
  | `slug` | `VARCHAR(180)` | `NOT NULL, UNIQUE` | URL-friendly keyword for routing endpoints |
  | `description` | `TEXT` | `NULL` | Detailed domain summary |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Modification timestamp |
  | `deleted_at` | `TIMESTAMP` | `NULL, DEFAULT NULL` | Soft delete archival timestamp |
* **Relationships:** Belongs To `categories` (parent); Has Many `categories` (children); Has Many `resources`.
* **Indexes:** Unique on `slug`, index on `parent_id`, `name`, and `deleted_at`.

---

### 3.4 `resources`
* **Purpose:** Core catalog repository representing institutional scientific documents. Manages secure online streaming routes without exposing direct filesystem paths.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique document ID |
  | `uuid` | `VARCHAR(36)` | `NOT NULL, UNIQUE` | Public routing token for secure streaming viewer |
  | `category_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to `categories.id` |
  | `title` | `VARCHAR(300)` | `NOT NULL` | Full literature title |
  | `author` | `VARCHAR(255)` | `NOT NULL` | Research authors or institutional division |
  | `abstract` | `TEXT` | `NULL` | Executive summary or synopsis |
  | `file_path` | `VARCHAR(512)` | `NOT NULL` | Private disk folder directory path |
  | `file_hash` | `VARCHAR(64)` | `NOT NULL, UNIQUE` | SHA-256 integrity and deduplication checksum |
  | `file_size_bytes`| `BIGINT UNSIGNED` | `NULL` | File disk volume size in bytes |
  | `page_count` | `INT UNSIGNED` | `NULL` | Total physical PDF page count |
  | `is_published` | `TINYINT(1) UNSIGNED`| `NOT NULL, DEFAULT 1` | Boolean catalog flag (1 = Public, 0 = Draft) |
  | `uploaded_by` | `BIGINT UNSIGNED` | `NOT NULL` | FK to uploading `users.id` (Librarian/Admin) |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Upload timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Modification timestamp |
  | `deleted_at` | `TIMESTAMP` | `NULL, DEFAULT NULL` | Soft delete archival timestamp |
* **Relationships:** Belongs To `categories` and `users`; Has Many `resource_chunks`, `access_logs`, and `notifications`.
* **Indexes:** Unique on `uuid` and `file_hash`; Composite index on `(is_published, created_at)` for instant catalog pagination feeds; Individual indexes on `title`, `category_id`, `uploaded_by`, and `deleted_at`.

---

### 3.5 `resource_chunks`
* **Purpose:** Serves as the authoritative ground-truth storage for RAG plain text slices and acts as the relational-vector bridge to Qdrant point IDs, complete with physical page navigation links for online streaming readers.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique chunk ID |
  | `resource_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to parent `resources.id` (`ON DELETE CASCADE`) |
  | `chunk_index` | `INT UNSIGNED` | `NOT NULL` | 0-indexed sequential order of text block in document |
  | `page_number` | `INT UNSIGNED` | `NOT NULL` | Primary PDF page number for reader citation jumping |
  | `chunk_text` | `MEDIUMTEXT` | `NOT NULL` | Extracted authoritative plaintext slice for LLM injection |
  | `vector_id` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Unique Qdrant Vector DB collection point pointer ID |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Chunk segmentation timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Modification timestamp |
* **Relationships:** Belongs To `resources` via `resource_id`.
* **Indexes:** Unique on `vector_id`; Unique composite constraint on `(resource_id, chunk_index)`; Composite reader navigation index on `(resource_id, page_number)`.

---

### 3.6 `access_logs`
* **Purpose:** An immutable read-only security ledger that tracks document streaming view sessions for administrative analytics and compliance auditing.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique log event ID |
  | `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to reading `users.id` (`ON DELETE CASCADE`) |
  | `resource_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to viewed `resources.id` (`ON DELETE CASCADE`) |
  | `ip_address` | `VARCHAR(45)` | `NULL` | Client IP origin (IPv4 and IPv6 compatible) |
  | `user_agent` | `VARCHAR(512)` | `NULL` | Browser application and OS signature string |
  | `accessed_at` | `TIMESTAMP` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP`| Immutable view event initialization timestamp |
* **Relationships:** Belongs To `users` and `resources`.
* **Indexes:** Composite analytical indexes on `(resource_id, accessed_at)` and `(user_id, accessed_at)`; Individual FK indexes on `user_id`, `resource_id`, and `accessed_at`.

---

### 3.7 `feedback`
* **Purpose:** Replaces cumbersome real-time person-to-person messaging with an asynchronous, trackable ticketing system for bug reporting, missing document proposals, and platform suggestions.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique support ticket ID |
  | `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to submitter `users.id` (`ON DELETE CASCADE`) |
  | `category` | `ENUM(...)` | `NOT NULL, DEFAULT 'suggestion'` | Problem category (`suggestion`, `problem`, `missing_resource`, `improvement`) |
  | `subject` | `VARCHAR(200)` | `NOT NULL` | Ticket headline summary |
  | `message` | `TEXT` | `NOT NULL` | Detailed problem description or book proposal |
  | `status` | `ENUM(...)` | `NOT NULL, DEFAULT 'pending'` | Administrative status (`pending`, `under_review`, `resolved`, `dismissed`) |
  | `admin_response`| `TEXT` | `NULL, DEFAULT NULL` | Official resolution statement from Librarian or Admin |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Submission timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Administrative resolution timestamp |
* **Relationships:** Belongs To `users`.
* **Indexes:** Composite administrative queue index on `(status, created_at)`; Individual indexes on `user_id` and `created_at`.

---

### 3.8 `notifications`
* **Purpose:** Manages administrative broadcast announcements and new catalog item promotional alerts.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique notification ID |
  | `resource_id` | `BIGINT UNSIGNED` | `NULL, DEFAULT NULL` | Optional link to promoted `resources.id` (`SET NULL`) |
  | `title` | `VARCHAR(200)` | `NOT NULL` | Alert headline |
  | `message` | `TEXT` | `NOT NULL` | Broadcast body content |
  | `type` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'announcement'`| Notification type flag (`announcement`, `new_resource`, `alert`) |
  | `created_by` | `BIGINT UNSIGNED` | `NULL, DEFAULT NULL` | FK to broadcasting `users.id` (`SET NULL`) |
  | `created_at` | `TIMESTAMP` | `NULL, DEFAULT CURRENT_TIMESTAMP` | Broadcast timestamp |
  | `updated_at` | `TIMESTAMP` | `NULL, ON UPDATE CURRENT_TIMESTAMP` | Modification timestamp |
* **Relationships:** Belongs To `resources` and `users` (author); Has Many `users` via pivot.
* **Indexes:** Individual indexes on `resource_id`, `created_by`, `type`, and `created_at`.

---

### 3.9 `notification_users`
* **Purpose:** Many-to-Many pivot table tracking individual user notification delivery and read receipts to compute real-time unread badge counters.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique pivot ID |
  | `notification_id`| `BIGINT UNSIGNED`| `NOT NULL` | FK to `notifications.id` (`ON DELETE CASCADE`) |
  | `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to recipient `users.id` (`ON DELETE CASCADE`) |
  | `read_at` | `TIMESTAMP` | `NULL, DEFAULT NULL` | Read confirmation timestamp (NULL indicates unread state) |
* **Relationships:** Belongs To `notifications` and `users`.
* **Indexes:** Unique composite constraint on `(notification_id, user_id)`; Composite unread badge index on `(user_id, read_at)`.

---

### 3.10 `ai_chat_history`
* **Purpose:** Immutably records conversational turns between users and the AI Library Assistant, incorporating structured JSON arrays of grounded document citations and interactive reader page foot-notes.
* **Columns:**
  | Column | Data Type | Attributes | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique turn ID |
  | `session_id` | `VARCHAR(36)` | `NOT NULL` | UUID grouping consecutive utterances into a chat session |
  | `user_id` | `BIGINT UNSIGNED` | `NOT NULL` | FK to interacting `users.id` (`ON DELETE CASCADE`) |
  | `role` | `VARCHAR(20)` | `NOT NULL` | Utterance role indicator (`user` or `assistant`) |
  | `message` | `TEXT` | `NOT NULL` | Question asked or AI response generated |
  | `citations` | `JSON` | `NULL, DEFAULT NULL` | Structured JSON array containing document UUIDs, titles, and `page_number` |
  | `created_at` | `TIMESTAMP` | `NOT NULL, DEFAULT CURRENT_TIMESTAMP`| Immutable conversation exchange timestamp |
* **Relationships:** Belongs To `users`.
* **Indexes:** Composite conversation load index on `(user_id, session_id, created_at)`; Individual indexes on `session_id`, `user_id`, and `created_at`.

---

## 4. End-to-End Database Package Verification Summary
* **No Missing Relationships:** Every foreign key constraint is structurally enforced with InnoDB cascading or restriction rules, guaranteeing zero orphaned database records.
* **No Duplicate Tables:** Exactly 10 dedicated, non-overlapping tables cover every functional domain requirement.
* **No Unnecessary Features:** All non-scope elements (borrowing, fines, physical book returns, direct real-time chats) remain strictly excluded.
* **Laravel Backend Ready:** Engineered specifically for Eloquent automatic table mapping, Spatie Permission compatibility, and streamlined Artisan migration sequences.
* **RAG AI Supported:** Equipped with `page_number` navigation pointers and engine-agnostic `vector_id` keys to achieve synchronous, secure RAG integration with Qdrant.
