# SSGI Digital Library Portal — RAG & Vector Database Architecture Guide
**Target Systems:** MySQL 8.0+ / InnoDB & Qdrant Vector Database  
**Integration Layer:** Laravel 12 Backend & AI Engine Bridge  
**Scope:** In-depth engineering review of the AI RAG (Retrieval-Augmented Generation) document processing pipeline, relational-to-vector mappings, structural optimizations for the `resource_chunks` table, and synchronization mechanics between MySQL and Qdrant.

---

## 1. Executive Summary: The Hybrid Relational-Vector Architecture
The SSGI Digital Library Portal integrates an advanced AI Library Assistant powered by Retrieval-Augmented Generation (RAG). Because institutional digital library items (scientific research papers, satellite engineering manuals, geospatial training workbooks) contain complex domain knowledge, LLMs require grounded text ingestion to eliminate hallucinations and provide mathematically precise answers with auditable citations.

To achieve enterprise-grade scalability and sub-millisecond retrieval speeds, the portal employs a **Hybrid Relational-Vector Architecture**:
1. **Qdrant Vector Database:** Specializes exclusively in high-dimensional semantic vector mathematics, utilizing Hierarchical Navigable Small World (HNSW) graph indexing to calculate Approximate Nearest Neighbors (ANN) via Cosine Similarity or Dot Product distance metrics.
2. **MySQL Database (`resource_chunks` & `resources`):** Specializes in structured relational data, ACID transaction integrity, Role-Based Access Control (RBAC), catalog discovery metadata, authoritative extracted plaintext storage, and user reading audit logs.

Embeddings (e.g., 1,536-dimensional floating-point arrays) are **never stored in MySQL**, as traditional relational engines cannot efficiently compute multi-dimensional Euclidean or Cosine distances across millions of vectors without exhaustive full-table scanning. Instead, MySQL acts as the authoritative truth system, retaining the natural language plaintext and storing a lightweight, indexed reference (`vector_id` / `qdrant_vector_id`) that directly binds relational document fragments to Qdrant vector point IDs.

---

## 2. End-to-End Document Ingestion & Vectorization Workflow

When an Administrator or Librarian uploads a new scientific publication into the SSGI catalog, the backend system initiates a background processing pipeline that seamlessly coordinates File Storage, Natural Language Processing (NLP), Qdrant, and MySQL:

```
  [ Librarian / Admin ]
         │
         ▼ (1) PDF Upload via Secure Endpoint
┌──────────────────────────────────────────────┐
│  Laravel 12 API / File Upload Controller     │
└──────────────────────┬───────────────────────┘
                       │ (2) Store raw encrypted PDF file & insert initial metadata
                       ▼
┌──────────────────────────────────────────────┐
│  Secure Private Storage (/private/resources) │
│  & MySQL `resources` Table (Status: Pending) │
└──────────────────────┬───────────────────────┘
                       │ (3) Dispatch asynchronous ingestion Queue Job
                       ▼
┌──────────────────────────────────────────────┐
│  Text Extraction & Normalization Worker      │
│  (Page-by-page optical / structural parsing) │
└──────────────────────┬───────────────────────┘
                       │ (4) Segment plain text into semantic sliding window blocks
                       ▼
┌──────────────────────────────────────────────┐
│  Chunk Creation (Recursive Text Splitter)    │
│  (Records chunk_index, page_number, & text)  │
└──────────────────────┬───────────────────────┘
                       │ (5) Submit text blocks to Embedding Model (e.g., OpenAI / Vertex AI)
                       ▼
┌──────────────────────────────────────────────┐
│  Embedding Generation (1536 Float Vectors)   │
└──────────────────────┬───────────────────────┘
                       │ (6) Upsert Point ID, Vector & Lightweight Filter Payload
                       ▼
┌──────────────────────────────────────────────┐
│  Qdrant Vector Database Collection           │
│  (Returns confirmation & unique Point IDs)   │
└──────────────────────┬───────────────────────┘
                       │ (7) Insert plaintext slices & Qdrant Point ID bindings
                       ▼
┌──────────────────────────────────────────────┐
│  MySQL Database (`resource_chunks` table)    │
│  (Binds resource_id + chunk_index + vector)  │
└──────────────────────────────────────────────┘
```

### Detailed Pipeline Stages:
1. **PDF Upload:** The PDF file is securely uploaded through the backend portal. Direct downloading or public link sharing is prohibited by system rules.
2. **Text Extraction & Normalization:** An automated background queue job opens the PDF document using high-fidelity parsing libraries (e.g., Poppler/pdftotext or specialized OCR engines for rasterized maps). The parser scans document streams **page-by-page**, stripping typographical headers/footers while preserving core scientific formulas, geospatial terminology, and structural headings.
3. **Chunk Creation:** Documents cannot be fed into embedding models whole due to token context window limitations and semantic dilution. A recursive text splitter segments the document into overlapping chunks (e.g., 500–800 words per block with a 15% overlap to preserve context across paragraph transitions). During this phase, the pipeline tags each chunk with its sequential order (`chunk_index`), its corresponding physical PDF page (`page_number`), and its natural language body (`chunk_text`).
4. **Embedding Generation:** The text chunks are submitted in batched arrays to an NLP embedding model (such as OpenAI `text-embedding-3-small` or local dense retrievers), returning multi-dimensional float vectors that represent the deep semantic meaning of each scientific passage.
5. **Qdrant Storage (Vector Upsert):** The backend client transmits an HTTP/gRPC upsert command to Qdrant. Each chunk is registered as a Vector Point containing:
   * **Point ID:** A unique UUID or unsigned 64-bit integer (e.g., `qdr_vec_etrss_chunk_00`).
   * **Vector:** The 1,536-dimensional float array.
   * **Payload (Metadata):** Lightweight filtering criteria, such as `resource_id`, `category_id`, `is_published`, and `author`, allowing Qdrant to perform filtered vector search without consulting MySQL first.
6. **Vector ID Saved in MySQL:** Upon receiving confirmation from Qdrant, the Laravel queue job performs a batch SQL insertion into the MySQL `resource_chunks` table. Each inserted row couples the foreign key `resource_id`, the sequential `chunk_index`, the originating `page_number`, the readable `chunk_text`, and the external binding key `vector_id`.

---

## 3. Deep-Dive Structural Review of `resource_chunks` Columns

A technical critique and analysis of the essential data attributes required within the MySQL `resource_chunks` entity:

| Attribute Name | Suggested Data Type | Laravel / DDL Status | Engineering Review & RAG Architectural Justification |
| :--- | :--- | :--- | :--- |
| **`chunk_index`** | `INT UNSIGNED NOT NULL` | Present in existing schema | **Essential for Context Window Expansion.** Keeps track of the sequential position of the text chunk within the document (0-indexed or 1-indexed). When a user submits an intricate query (e.g., "Explain the mathematical proof for gravity anomaly modeling"), a single retrieved chunk might cut off mid-equation. Because `chunk_index` is sequentially ordered in MySQL, the Laravel backend can automatically retrieve surrounding chunks (`WHERE resource_id = X AND chunk_index IN (hit_index - 1, hit_index, hit_index + 1)`) to assemble a coherent, expanded context window for the LLM! |
| **`page_number`** | `INT UNSIGNED NOT NULL` | **Critical Improvement Identified** (Missing from baseline DDL) | **Indispensable for Online Read-Only Stream Citation.** In accordance with institutional security rules, users cannot download PDFs; they must read them online via a secure streaming viewer. When the AI Library Assistant cites a document in chat, users need a direct navigation link to verify the source. Storing the primary `page_number` where the chunk occurs enables the backend to output structured citation bookmarks in API responses (e.g., `/api/resources/stream/uuid#page=14`), allowing users to click an AI footnote and immediately launch the streaming reader directly at the precise page of interest. |
| **`chunk_text`** *(currently `content`)* | `MEDIUMTEXT` / `LONGTEXT` | Present as `content`; **Recommend Alias Review** | **Authoritative Ground-Truth Storage.** Storing the extracted plain text directly in MySQL ensures high availability and eliminates the need to constantly re-read raw PDFs during conversational turns. While the name `content` is functionally sufficient, standardizing on `chunk_text` provides enhanced domain clarity for LLM/RAG developers, explicitly differentiating extracted plaintext slices from binary file uploads or abstract summaries. Furthermore, configuring this column with `utf8mb4_unicode_ci` collation is mandatory to support complex scientific symbols, equations, and multilingual Ethiopic scripts (Amharic) without character corruption. |
| **`vector_id`** *(currently `qdrant_vector_id`)* | `VARCHAR(255) NOT NULL` | Present as `qdrant_vector_id` | **The External Semantic Bridge.** Holds the exact unique pointer ID corresponding to the vector inside Qdrant's collection. While `qdrant_vector_id` clearly denotes the target database technology, using the agnostic column name `vector_id` represents a cleaner architectural decoupling—ensuring that if the institute ever migrates to an alternative vector engine (e.g., Milvus, pgvector, or Weaviate), the MySQL DDL remains perfectly abstracted without requiring column renaming migrations. Applying a `UNIQUE` constraint to this field is vital to prevent orphan vectors or duplicate references. |

---

## 4. Recommended Architectural Improvements & Refined Schema

Based on the engineering review above, the existing `resource_chunks` structure requires **two primary architectural improvements**:
1. **Incorporate `page_number` Column:** Add `page_number INT UNSIGNED NOT NULL` immediately following `chunk_index`. This completes the UX citation loop for the read-only streaming reader.
2. **Add Composite Performance Index on `(resource_id, page_number)`:** Allows instantaneous lookup of all text chunks residing on a specific PDF page, enabling the UI to highlight cited text snippets when a user jumps to that page in the streaming viewer.
3. *(Optional Naming Standardization):* Alias or rename `content` to `chunk_text` and `qdrant_vector_id` to `vector_id` for cleaner integration with modern LLM operational frameworks (LangChain, LlamaIndex, Semantic Kernel).

### Recommended DDL Script for `resource_chunks`:

```sql
CREATE TABLE IF NOT EXISTS resource_chunks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT UNSIGNED NOT NULL COMMENT 'Parent digital library book or document',
    chunk_index INT UNSIGNED NOT NULL COMMENT '0-indexed sequence order of text slice within document',
    page_number INT UNSIGNED NOT NULL COMMENT 'Primary PDF physical page number for streaming reader jumping',
    chunk_text MEDIUMTEXT NOT NULL COMMENT 'Extracted natural language plaintext slice for LLM context injection',
    vector_id VARCHAR(255) NOT NULL COMMENT 'Unique point identifier mapping to Qdrant vector database collection',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Binding (Cascaded purge)
    CONSTRAINT fk_resource_chunks_resource 
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique Constraints & Performance Indexes
    UNIQUE KEY uk_vector_id (vector_id),
    UNIQUE KEY uk_resource_chunk_sequence (resource_id, chunk_index),
    INDEX idx_resource_page (resource_id, page_number),
    INDEX idx_resource_id (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='RAG text chunks and Qdrant vector storage bridge';
```

---

## 5. How MySQL Connects with Qdrant (System Mechanics & Synchronization)

Because MySQL and Qdrant exist as independent database engines, the Laravel backend functions as the orchestration layer responsible for maintaining synchronization, enforcing security permissions, and linking conversational query executions.

### 5.1 Real-Time RAG Query Execution Lifecycle
When a user interactively chats with the AI Library Assistant, the connection between Qdrant and MySQL operates in a high-speed synchronous loop:

```
[ User Chat Input ] ───► "What frequency does ETRSS-2 use for telemetry downlink?"
                               │
                               ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ 1. Laravel AI Controller translates prompt to float vector  │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ (Float Array [0.023, -0.114, ...])
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ 2. Qdrant Vector Search (Filtered by is_published = true)   │
        │    Returns top 3 semantic matches (Point IDs + Score: 0.94) │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ (Matches: ['qdr_vec_etrss_chunk_00', ...])
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ 3. MySQL Relational Lookup via Eloquent ORM:                │
        │    SELECT * FROM resource_chunks                            │
        │    WHERE vector_id IN ('qdr_vec_etrss_chunk_00', ...)       │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ (Returns: chunk_text, page_number, & book titles)
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ 4. Prompt Assembly & LLM Inference (Gemini / OpenAI API)    │
        │    Injects grounded text + enforces read-only citation link  │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
[ AI Response + Footnote Link ] ───► "ETRSS operates at 8.2 GHz X-band... [View Book Page 94]"
```

### 5.2 Synchronization & Referential Integrity Management
Maintaining consistency across separate relational and vector databases requires rigorous lifecycle controls:

1. **Transactional Atomicity during Ingestion:**
   * When a document is processed, the backend uploads vector arrays to Qdrant first. Once Qdrant acknowledges successful storage of the point IDs, the database transaction in MySQL commits the new rows in `resource_chunks`. If MySQL fails, an asynchronous failure handler invokes Qdrant’s deletion API to cleanse the orphan vectors.
2. **Soft Deletes & Unpublished Document Isolation:**
   * If a librarian unpublishes a resource (`is_published = 0`) or soft-deletes a book (`deleted_at IS NOT NULL`) in MySQL, those document chunks must not surface in AI responses to general staff or guests.
   * **Dual-Layer Enforcement:**
     1. *At Vector Search Time (Qdrant):* The Qdrant search payload includes a boolean filter (`filter: { must: [{ key: 'is_published', match: { value: true } }] }`).
     2. *At Relational Lookup Time (MySQL):* The backend query enforces an inner join constraint against the parent `resources` table:  
        `ResourceChunk::whereHas('resource', function ($query) { $query->where('is_published', true); })->whereIn('vector_id', $qdrantMatches)->get();`  
     This double-check guarantees zero information leakage of classified or draft manuscripts.
3. **Cascading Deletion Lifecycle (Orphan Prevention):**
   * MySQL enforces relational integrity via `ON DELETE CASCADE` between `resources` and `resource_chunks`. When a document is physically purged from MySQL, its corresponding records in `resource_chunks` are automatically destroyed.
   * To prevent dangling vectors from accumulating inside Qdrant, the Laravel application model utilizes an Eloquent **Model Observer** (`ResourceObserver` or `ResourceChunkObserver`). When the `'deleted'` Eloquent event fires, the observer dispatches an automated HTTP `POST /collections/ssgi_library/points/delete` call to Qdrant, transmitting the array of deleted `vector_id` strings to eradicate the semantic vectors instantaneously.
