# Entity-Relationship Diagram (ERD) Technical Documentation — SSGI Digital Library Portal

This document accompanies the generated visual schema diagram (`ERD.png`), detailing the exact relational cardinality, professional notation standards, primary keys (PK), foreign keys (FK), and architectural boundaries of the **SSGI Digital Library Portal** database.

---

## 1. Visual ER Diagram Layout (Ascii & Mermaid Mapping)

The database architecture is designed with clear hierarchical processing flows from Role-Based Access Control (RBAC) down to AI Retrieval-Augmented Generation (RAG) vector storage:

```
                            [ roles ]
                                │
                                │ 1 : N (defines tier)
                                ▼
                            [ users ]
                                │
        ┌───────────────────────┼───────────────────────┐
        │ 1 : N (uploads)       │ 1 : N (submits)       │ 1 : N (reads)
        ▼                       ▼                       ▼
   [ resources ]          [ feedback ]            [ access_logs ]
        │                                               ▲
        │ 1 : N (text chunks)                           │
        ▼                                               │ 1 : N (tracked in)
[ resource_chunks ] ────────────────────────────────────┘
        │
        │ 1 : 1 (qdrant_vector_id)
        ▼
 [ Qdrant Vector DB ]
```

### Supporting Broadcast Topology:
```
[ notifications ] ─── 1 : N (recipients) ───► [ notification_users ] ◄─── 1 : N (receives) ─── [ users ]
```

---

## 2. Table-by-Table Relational Specifications

### 1. `roles` (RBAC Definition Table)
* **Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
* **Core Attributes:** `name`, `guard_name`
* **Relationships:**
  * `1 : N` to **`users`** — One access tier (`Administrator`, `Librarian`, `Staff`, or `Guest`) controls privileges for multiple authenticated accounts.
* **Notation Rules:** Complies directly with Spatie Laravel Permission conventions.

---

### 2. `users` (Core Authentication Table)
* **Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
* **Foreign Keys:** `role_id` → `roles.id`
* **Core Attributes:** `name`, `email` (Unique), `password`, `deleted_at` (Soft Delete)
* **Relationships:**
  * **Parent to:** `resources` (uploads), `feedback` (submits tickets), `access_logs` (reading session audits), and `notification_users` (broadcast recipients).
  * **Child of:** `roles`.

---

### 3. `resources` (Digital Library Catalog)
* **Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
* **Foreign Keys:**
  * `category_id` → `categories.id`
  * `uploaded_by` → `users.id`
* **Core Attributes:** `uuid` (Unique streaming token), `title`, `file_path`, `file_hash`, `is_published`
* **Relationships:**
  * **Parent to:** `resource_chunks` (text slices for AI RAG) and `access_logs` (read tracking).
  * **Security Rules:** Documents are exposed solely through stream endpoints authenticated via `uuid`. Raw downloads and physical checkout metrics (`quantity`/`available`/`due_at`) are entirely eliminated.

---

### 4. `feedback` (Asynchronous Ticketing)
* **Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
* **Foreign Keys:** `user_id` → `users.id`
* **Core Attributes:** `category` (`suggestion`, `problem`, `missing_resource`, `improvement`), `subject`, `status`, `admin_response`
* **Relationships:**
  * **Child of:** `users`
* **Architectural Purpose:** Exclusively replaces live user chat with structured, traceable problem reporting and literature requests.

---

### 5. `access_logs` (Security & Read Audit Ledger)
* **Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
* **Foreign Keys:**
  * `user_id` → `users.id`
  * `resource_id` → `resources.id`
* **Core Attributes:** `ip_address`, `user_agent`, `accessed_at` (Indexed)
* **Relationships:**
  * **Child of:** `users` and `resources`.
* **Architectural Purpose:** Immutably records every online reading session without allowing file redistribution.

---

### 6. `resource_chunks` (AI RAG Text Extraction Layer)
* **Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
* **Foreign Keys:** `resource_id` → `resources.id` (`ON DELETE CASCADE`)
* **Core Attributes:** `chunk_index`, `content` (`MEDIUMTEXT`), `qdrant_vector_id` (Unique pointer)
* **Relationships:**
  * **Child of:** `resources` (`1 : N`)
  * **Bridge to:** `Qdrant Vector Database` (`1 : 1`)
* **RAG Design Rationale:** MySQL retains the natural language text (`content`) for context compilation during Large Language Model inference, while offloading computationally heavy embedding arrays to Qdrant.

---

### 7. `Qdrant Vector DB` (External Semantic Storage)
* **Primary Key:** `point_id` (Matches `resource_chunks.qdrant_vector_id`)
* **Core Attributes:** `embedding` (768 or 1536-dimensional float vector array), `payload` (JSON metadata)
* **Relationships:**
  * **Linked 1-to-1:** With MySQL rows inside `resource_chunks`. Embeddings are never mirrored inside MySQL to preserve database buffer RAM and search velocity.

---

### 8. `notifications` & 9. `notification_users` (Broadcast Engine)
* **`notifications` Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
  * **Foreign Keys:** `resource_id` (Nullable link to new book), `created_by` → `users.id`
* **`notification_users` Primary Key:** `id` (`BIGINT UNSIGNED AUTO_INCREMENT`)
  * **Foreign Keys:** `notification_id` → `notifications.id`, `user_id` → `users.id`
  * **Core Attributes:** `read_at` (Timestamp for unread badge calculation)
* **Relationships:** Acts as a many-to-many junction enabling librarians to broadcast system alerts and new catalog acquisitions to staff and trainees with granular read-receipt tracking.

---

## 3. Professional Database Notation Standards Employed
* **PK (Primary Key):** Denoted in solid green (`#16A34A`), indicating indexed, unsigned BigInt unique auto-incrementing identifiers.
* **FK (Foreign Key):** Denoted in warm amber (`#D97706`), establishing strict referential integrity constraints across tables (`ON DELETE RESTRICT` for users/resources, `ON DELETE CASCADE` for logs/chunks/pivots).
* **UK (Unique Key):** Denoted in royal blue (`#0284C7`), indicating mandatory unique constraint indexes on critical security identifiers (`email`, `uuid`, `qdrant_vector_id`, `file_hash`).
* **Cardinality Notation:** Uses standard **1 : N (One-to-Many)** arrows for standard relational parent-child bindings and **1 : 1 (One-to-One Dashed)** green bridging lines representing the hybrid integration between relational MySQL entities and external Qdrant vector storage points.
