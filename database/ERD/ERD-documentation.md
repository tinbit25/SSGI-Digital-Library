# Entity Relationship Diagram (ERD) Technical Documentation
**Project:** SSGI Digital Library Portal  
**Scope:** Relational mappings, cardinality specifications, and hybrid vector database integrations for the enterprise database architecture.  
**Diagram Reference Asset:** `ERD.png`

---

## 1. Executive Summary & ERD Layout Architecture
The generated Entity Relationship Diagram (`ERD.png`) presents a complete architectural visual of the database topology engineered for the **Ethiopian Space Science and Geospatial Institute (SSGI) Digital Library Portal**. 

The architecture is partitioned into four distinct functional tiers:
1. **Security & Access Tier:** Handles institutional authentication and permission roles (`roles`, `users`, and security read logs `access_logs`).
2. **Library Catalog Tier:** Governs domain classifications and protected document literature (`categories` and `resources`).
3. **Institutional Support & Communications Tier:** Handles administrative broadcasting and user support ticketing (`feedback`, `notifications`, and pivot table `notification_users`).
4. **Hybrid AI & RAG Engine Tier:** Connects relational MySQL metadata to multi-dimensional vector embeddings stored in Qdrant (`resource_chunks`, `ai_chat_history`, and the `Qdrant Vector Database` external service point).

---

## 2. Comprehensive Table Relationship Catalog & Cardinalities

### 2.1 Core Authorization & Institutional Security
* **`roles` ──(1:N)──► `users`**
  * *Cardinality:* One-to-Many (`users.role_id` → `roles.id`).
  * *Business Rule:* Every user account in the portal (Administrator, Librarian, Staff, or Guest) must be assigned exactly one governing permission tier. Deletion of an active role is administratively restricted (`ON DELETE RESTRICT`) to prevent orphaned user identities.

* **`users` ──(1:N)──► `access_logs` ◄──(N:1)── `resources`**
  * *Cardinality:* Many-to-Many resolve via intersection ledger (`access_logs.user_id` → `users.id`, `access_logs.resource_id` → `resources.id`).
  * *Business Rule:* In compliance with the system rule prohibiting file downloads, documents are consumed exclusively online through a secure streaming reader. Each view event generates an immutable tracking record containing timestamp, IP origin, and browser agent string. If an administrative purge removes a document or user account, associated historical stream events are cleaned (`ON DELETE CASCADE`).

---

### 2.2 Library Literature & Catalog Taxonomy
* **`categories` ──(1:N)──► `categories` (Self-Referential Taxonomy)**
  * *Cardinality:* One-to-Many (`categories.parent_id` → `categories.id`).
  * *Business Rule:* Supports deeply nested scientific classifications (e.g., *Geospatial Information* → *Remote Sensing* → *LiDAR Analytics*). Root parent domains store `NULL` in `parent_id`. If a primary domain is removed, subordinate child divisions decouple to become independent top-level categories (`ON DELETE SET NULL`).

* **`categories` ──(1:N)──► `resources` ◄──(N:1)── `users`**
  * *Cardinality:* Two One-to-Many relationships (`resources.category_id` → `categories.id`, `resources.uploaded_by` → `users.id`).
  * *Business Rule:* Every digital resource is strictly categorized under an established taxonomy domain and explicitly tied to the uploading Librarian or Administrator account for operational provenance. Neither a category nor a librarian account can be purged from MySQL while active literature remains bound to them (`ON DELETE RESTRICT`).

---

### 2.3 Interactive AI RAG & Vector Engine Integration
* **`resources` ──(1:N)──► `resource_chunks`**
  * *Cardinality:* One-to-Many (`resource_chunks.resource_id` → `resources.id`).
  * *Business Rule:* When a PDF is processed by the AI ingestion queue, its structural body is segmented into sequential natural language plaintext blocks (`chunk_text`). Each row logs its sequential index (`chunk_index`) and physical PDF page number (`page_number`) to power interactive streaming reader jumps. Deleting a book automatically wipes all of its extracted RAG plaintext blocks (`ON DELETE CASCADE`).

* **`resource_chunks` ──(1:1 Hybrid Binding)──► `Qdrant Vector DB`**
  * *Cardinality:* One-to-One Cross-Engine Link (`resource_chunks.vector_id` → `Qdrant Point ID`).
  * *Business Rule:* To ensure optimal database performance, multi-dimensional semantic float embeddings (1536 dimensions) are **not stored in MySQL**. Instead, embeddings are upserted into an external **Qdrant Vector Database**. MySQL retains the authoritative plaintext (`chunk_text`), page number (`page_number`), and a unique string identifier (`vector_id`). During RAG semantic queries, the backend retrieves matching vector IDs from Qdrant and joins them against `resource_chunks` to construct grounded LLM prompts with interactive page footnotes.

* **`users` ──(1:N)──► `ai_chat_history`**
  * *Cardinality:* One-to-Many (`ai_chat_history.user_id` → `users.id`).
  * *Business Rule:* Stores conversational turn-by-turn dialogue between institutional users and the RAG AI Assistant. Incorporates a structured JSON field (`citations`) that stores referenced document UUIDs, titles, and matching page numbers (`page_number`), allowing UI widgets to render clickable citation badges directly to the streaming reader.

---

### 2.4 Asynchronous Support Ticketing & System Broadcasts
* **`users` ──(1:N)──► `feedback`**
  * *Cardinality:* One-to-Many (`feedback.user_id` → `users.id`).
  * *Business Rule:* Replaces prohibited real-time chat rooms with an auditable support ticket workflow (reporting bugs, requesting missing books, or submitting UI suggestions). Deleting a user account cleans their historical feedback submissions (`ON DELETE CASCADE`).

* **`resources` ──(1:N)──► `notifications` ◄──(N:1)── `users` (Author)**
  * *Cardinality:* Optional One-to-Many linkages (`notifications.resource_id` → `resources.id`, `notifications.created_by` → `users.id`).
  * *Business Rule:* Librarians broadcast system maintenance alerts or promote new library catalog items. Both foreign keys are nullable (`ON DELETE SET NULL`), ensuring global announcements persist even if an uploading author is archived or a specific book is removed.

* **`notifications` ──(1:N)──► `notification_users` ◄──(N:1)── `users` (Recipients)**
  * *Cardinality:* Many-to-Many resolved via pivot (`notification_users.notification_id` → `notifications.id`, `notification_users.user_id` → `users.id`).
  * *Business Rule:* Tracks broadcast delivery across user populations. The `read_at` datetime column powers real-time unread navbar badges; a `NULL` value explicitly marks the alert as unread for that specific recipient.

---

## 3. Scope Enforcement & Structural Validation
The database architecture explicitly guarantees compliance with institutional rules:
1. **Zero Borrowing or Return Logic:** Tables for QR code borrowing, due dates, reservation queues, book return registers, and overdue fine calculation loops have been entirely excluded.
2. **Zero Peer-to-Peer Messaging:** Real-time chat tables, direct user messages, and socket rooms have been excluded in favor of structured administrative `feedback` tickets and centralized `notifications`.
3. **Secure Read-Only Access Assurance:** `resources` restricts physical file paths (`file_path`) while providing public streaming UUIDs (`uuid`), ensuring user access logs only audit authenticated streaming sessions without exposing binary PDF files to direct downloading.
