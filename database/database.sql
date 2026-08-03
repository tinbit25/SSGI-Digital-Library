-- ============================================================================
-- SSGI Digital Library Portal — Production-Ready MySQL Database Schema (Stage 1)
-- Engine: MySQL 8.0+ / InnoDB
-- Character Set: utf8mb4 / utf8mb4_unicode_ci (Multi-lingual & Symbol Support)
-- Architecture: Hybrid Relational-Vector (MySQL + Qdrant RAG Engine Integration)
-- Framework Compatibility: Laravel 12 / Eloquent ORM
-- ============================================================================
-- IMPORTANT SYSTEM RULES & SCOPE COMPLIANCE:
-- 1. READ-ONLY ACCESS: Users can only search and view documents online via a
--    secure PDF streaming reader. Direct downloads, raw PDF exposure, printing,
--    QR code borrowing, book returns, and fine calculations are STRONGLY EXCLUDED.
-- 2. HYBRID AI RAG INTEGRATION: Document embeddings are NOT stored in MySQL.
--    MySQL retains extracted plaintext chunks and physical page numbers for
--    online reader navigation, mapped via unique vector_id pointers to Qdrant.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS ssgi_digital_library 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE ssgi_digital_library;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to ensure a clean, idempotent production schema build
DROP TABLE IF EXISTS ai_chat_history;
DROP TABLE IF EXISTS resource_chunks;
DROP TABLE IF EXISTS notification_users;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. ROLES TABLE (Role-Based Access Control - Spatie Permission Compatible)
-- ============================================================================
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    name VARCHAR(50) NOT NULL COMMENT 'Role designation (Administrator, Librarian, Staff, Guest)',
    guard_name VARCHAR(50) NOT NULL DEFAULT 'web' COMMENT 'Authentication guard name for Spatie/Laravel RBAC',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    
    -- Indexes
    UNIQUE KEY uk_roles_name_guard (name, guard_name),
    INDEX idx_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User authorization roles and permission hierarchy';

-- ============================================================================
-- 2. USERS TABLE (Institutional Accounts & Authentication)
-- ============================================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    role_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key to roles table',
    name VARCHAR(255) NOT NULL COMMENT 'Full administrative or user name',
    email VARCHAR(255) NOT NULL COMMENT 'Unique institutional email address (@ssgi.gov.et)',
    email_verified_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Email verification timestamp',
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt / Argon2 hashed authentication password',
    remember_token VARCHAR(100) NULL DEFAULT NULL COMMENT 'Laravel session remember-me token',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account registration timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Account profile modification timestamp',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp for non-destructive archiving',
    
    -- Foreign Key Constraints
    CONSTRAINT fk_users_role 
        FOREIGN KEY (role_id) REFERENCES roles(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_role_id (role_id),
    INDEX idx_users_created_at (created_at),
    INDEX idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registered institutional user accounts and credentials';

-- ============================================================================
-- 3. CATEGORIES TABLE (Hierarchical Library Taxonomy)
-- ============================================================================
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    parent_id BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Self-referential parent category ID for nested subdomains',
    name VARCHAR(150) NOT NULL COMMENT 'Category title (GIS, Remote Sensing, Satellite Technology, etc.)',
    slug VARCHAR(180) NOT NULL COMMENT 'URL-friendly keyword slug for API route endpoints',
    description TEXT NULL COMMENT 'Detailed overview of the domain or training topic',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Category creation timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Category modification timestamp',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp for archiving taxonomy trees',
    
    -- Foreign Key Constraints
    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    UNIQUE KEY uk_categories_slug (slug),
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_name (name),
    INDEX idx_categories_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Taxonomical classifications and subcategories for digital literature';

-- ============================================================================
-- 4. RESOURCES TABLE (Digital Document Catalog & Read-Only Stream Control)
-- ============================================================================
CREATE TABLE resources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    uuid VARCHAR(36) NOT NULL COMMENT 'Universal Unique Identifier for secure read-only PDF stream routing',
    category_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key binding to categories taxonomy',
    title VARCHAR(300) NOT NULL COMMENT 'Complete document or research paper title',
    author VARCHAR(255) NOT NULL COMMENT 'Primary research authors, satellite department, or publication body',
    abstract TEXT NULL COMMENT 'Executive overview or synopsis of the digital resource',
    file_path VARCHAR(512) NOT NULL COMMENT 'Protected disk directory path (inaccessible to public HTTP web server)',
    file_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 binary hash ensuring file integrity and deduplication',
    file_size_bytes BIGINT UNSIGNED NULL COMMENT 'File disk volume in bytes for administrative quota storage',
    page_count INT UNSIGNED NULL COMMENT 'Total physical PDF page count computed during pipeline ingestion',
    is_published TINYINT(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Boolean visibility flag (1 = Public Catalog, 0 = Draft/Unpublished)',
    uploaded_by BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key mapping to uploading Librarian or Administrator (users table)',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Document repository upload timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Catalog metadata modification timestamp',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp for archiving resource records',
    
    -- Foreign Key Constraints
    CONSTRAINT fk_resources_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_resources_uploader 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes & Performance Optimizations
    UNIQUE KEY uk_resources_uuid (uuid),
    UNIQUE KEY uk_resources_file_hash (file_hash),
    INDEX idx_resources_title (title),
    INDEX idx_resources_category_id (category_id),
    INDEX idx_resources_uploaded_by (uploaded_by),
    INDEX idx_resources_deleted_at (deleted_at),
    INDEX idx_resources_published_created (is_published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Core digital library catalog repository and secure stream pointers';

-- ============================================================================
-- 5. RESOURCE CHUNKS TABLE (RAG Plaintext Slices & Qdrant Vector DB Bridge)
-- ============================================================================
CREATE TABLE resource_chunks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    resource_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key linking chunk to parent resource document',
    chunk_index INT UNSIGNED NOT NULL COMMENT '0-indexed sequence position of plaintext block within the document',
    page_number INT UNSIGNED NOT NULL COMMENT 'Primary PDF physical page number for interactive reader navigation jumping',
    chunk_text MEDIUMTEXT NOT NULL COMMENT 'Extracted natural language plaintext block for LLM prompt grounding',
    vector_id VARCHAR(255) NOT NULL COMMENT 'Unique pointer ID mapping to Qdrant vector database collection point',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Chunk segmentation and vector insertion timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Chunk content or mapping update timestamp',
    
    -- Foreign Key Constraints (Cascading deletion guarantees zero orphan text slices)
    CONSTRAINT fk_resource_chunks_resource 
        FOREIGN KEY (resource_id) REFERENCES resources(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes & Uniqueness Guarantees
    UNIQUE KEY uk_vector_id (vector_id),
    UNIQUE KEY uk_resource_chunk_sequence (resource_id, chunk_index),
    INDEX idx_resource_page (resource_id, page_number),
    INDEX idx_resource_id (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plaintext semantic RAG chunks with interactive page links and Qdrant vector pointers';

-- ============================================================================
-- 6. ACCESS LOGS TABLE (Immutable Read-Only Security Audit & Analytics Ledger)
-- ============================================================================
CREATE TABLE access_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key mapping to authenticated reading user',
    resource_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key mapping to accessed document resource',
    ip_address VARCHAR(45) NULL COMMENT 'Client origin IP address (supports IPv4 and IPv6 formatting)',
    user_agent VARCHAR(512) NULL COMMENT 'Client browser application and OS identifier string',
    accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Immutable timestamp of document reading session initiation',
    
    -- Foreign Key Constraints (Cascading cleanup on record removal)
    CONSTRAINT fk_access_logs_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_access_logs_resource 
        FOREIGN KEY (resource_id) REFERENCES resources(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- High-Performance Analytical & Audit Indexes
    INDEX idx_access_logs_user_id (user_id),
    INDEX idx_access_logs_resource_id (resource_id),
    INDEX idx_access_logs_accessed_at (accessed_at),
    INDEX idx_access_logs_resource_time (resource_id, accessed_at),
    INDEX idx_access_logs_user_time (user_id, accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Immutable read session logs tracking institutional document usage and user activity';

-- ============================================================================
-- 7. FEEDBACK TABLE (Structured Institutional Support & Resource Requests)
-- ============================================================================
CREATE TABLE feedback (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key mapping to staff or guest submitter',
    category ENUM('suggestion', 'problem', 'missing_resource', 'improvement') NOT NULL DEFAULT 'suggestion' COMMENT 'Support ticket classification category',
    subject VARCHAR(200) NOT NULL COMMENT 'Brief summary title of the user inquiry or resource proposal',
    message TEXT NOT NULL COMMENT 'Detailed explanation of problem encountered or book requested',
    status ENUM('pending', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending' COMMENT 'Administrative progression status of the support ticket',
    admin_response TEXT NULL DEFAULT NULL COMMENT 'Official resolution statement provided by Librarian or Admin',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Feedback submission timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Administrative processing modification timestamp',
    
    -- Foreign Key Constraints
    CONSTRAINT fk_feedback_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_feedback_user_id (user_id),
    INDEX idx_feedback_created_at (created_at),
    INDEX idx_feedback_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asynchronous user feedback tickets, bug reports, and missing resource requisitions';

-- ============================================================================
-- 8. NOTIFICATIONS TABLE (System Announcements & Catalog Promotional Alerts)
-- ============================================================================
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    resource_id BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Optional link to newly promoted document in catalog',
    title VARCHAR(200) NOT NULL COMMENT 'Headline of the alert or system maintenance notice',
    message TEXT NOT NULL COMMENT 'Complete informative message broadcasted to end-users',
    type VARCHAR(50) NOT NULL DEFAULT 'announcement' COMMENT 'Notification type indicator (announcement, new_resource, alert)',
    created_by BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Authoring Administrator or Librarian account ID',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Broadcast distribution timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Broadcast message modification timestamp',
    
    -- Foreign Key Constraints (Set null on deletion to protect broadcast history)
    CONSTRAINT fk_notifications_resource 
        FOREIGN KEY (resource_id) REFERENCES resources(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_creator 
        FOREIGN KEY (created_by) REFERENCES users(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_notifications_resource_id (resource_id),
    INDEX idx_notifications_created_by (created_by),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Administrative broadcasts, system alerts, and new library item announcements';

-- ============================================================================
-- 9. NOTIFICATION USERS TABLE (Pivot Read-Receipts & Unread Badge Counter)
-- ============================================================================
CREATE TABLE notification_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    notification_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key to published broadcast notification',
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key to recipient user account',
    read_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Read-receipt confirmation timestamp (NULL indicates Unread alert)',
    
    -- Foreign Key Constraints (Cascading cleanup on record removal)
    CONSTRAINT fk_notification_users_notification 
        FOREIGN KEY (notification_id) REFERENCES notifications(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notification_users_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes & Deduplication Rules
    UNIQUE KEY uk_notification_user (notification_id, user_id),
    INDEX idx_notification_users_notification_id (notification_id),
    INDEX idx_notification_users_user_id (user_id),
    INDEX idx_notification_users_read_at (read_at),
    INDEX idx_notification_users_user_read (user_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Many-to-Many pivot tracking user notification delivery and unread status counters';

-- ============================================================================
-- 10. AI CHAT HISTORY TABLE (Conversational Turns & Interactive RAG Citations)
-- ============================================================================
CREATE TABLE ai_chat_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key ID',
    session_id VARCHAR(36) NOT NULL COMMENT 'UUID grouping consecutive user prompts and assistant replies in a single chat session',
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key mapping to querying institution user account',
    role VARCHAR(20) NOT NULL COMMENT 'Dialogue origin role identifier (user or assistant)',
    message TEXT NOT NULL COMMENT 'Natural language question asked by user or grounded synthesis generated by AI',
    citations JSON NULL DEFAULT NULL COMMENT 'Structured JSON array of cited document UUIDs, page numbers, and vector hit IDs',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Immutable conversational utterance timestamp',
    
    -- Foreign Key Constraints
    CONSTRAINT fk_ai_chat_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for Instantaneous RAG Window Loading
    INDEX idx_ai_chat_session_id (session_id),
    INDEX idx_ai_chat_user_id (user_id),
    INDEX idx_ai_chat_created_at (created_at),
    INDEX idx_ai_chat_user_session_time (user_id, session_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conversational logs for AI Library Assistant sessions complete with interactive RAG citations';

-- ============================================================================
-- End of SSGI Digital Library Portal Master Schema (10 Tables)
-- ============================================================================
