-- ============================================================================
-- SSGI Digital Library Portal — Production-Ready MySQL Schema
-- Database Engine: MySQL 8.0+ / InnoDB
-- Compatibility: Laravel 12 (Eloquent ORM & Spatie Permission Conventions)
-- Purpose: Supports secure online read-only document access, RAG vector IDs,
--          asynchronous feedback loops, and broadcast notifications.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS ssgi_digital_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssgi_digital_library;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS ai_chat_history;
DROP TABLE IF EXISTS notification_users;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS resource_chunks;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Table: roles
-- Purpose: Defines role tiers (Administrator, Librarian, Staff, Guest)
-- Compatibility: Spatie Laravel Permission
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_name_guard (name, guard_name),
    KEY idx_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: users
-- Purpose: Central authentication table for staff, trainees, librarians, and admins
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    role_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_role_id (role_id),
    KEY idx_users_created_at (created_at),
    KEY idx_users_deleted_at (deleted_at),
    CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: categories
-- Purpose: Hierarchical domain grouping (Space Science, GIS, Remote Sensing)
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    parent_id BIGINT UNSIGNED NULL DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_slug (slug),
    KEY idx_categories_parent_id (parent_id),
    KEY idx_categories_name (name),
    KEY idx_categories_deleted_at (deleted_at),
    CONSTRAINT fk_categories_parent_id FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: resources
-- Purpose: Digital literature catalog with secure filesystem mapping
-- ----------------------------------------------------------------------------
CREATE TABLE resources (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    abstract TEXT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NULL DEFAULT NULL,
    page_count INT UNSIGNED NULL DEFAULT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    uploaded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_resources_uuid (uuid),
    UNIQUE KEY uk_resources_file_hash (file_hash),
    KEY idx_resources_title (title),
    KEY idx_resources_category_id (category_id),
    KEY idx_resources_uploaded_by (uploaded_by),
    KEY idx_resources_published_created (is_published, created_at),
    KEY idx_resources_deleted_at (deleted_at),
    CONSTRAINT fk_resources_category_id FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_resources_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: resource_chunks
-- Purpose: Relational bridge linking document raw text slices to Qdrant vector IDs
-- Note: Multidimensional embedding vectors are NOT stored here; only Qdrant IDs.
-- ----------------------------------------------------------------------------
CREATE TABLE resource_chunks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NOT NULL,
    chunk_index INT UNSIGNED NOT NULL,
    content MEDIUMTEXT NOT NULL,
    qdrant_vector_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_resource_chunk_idx (resource_id, chunk_index),
    UNIQUE KEY uk_qdrant_vector_id (qdrant_vector_id),
    KEY idx_resource_chunks_resource_id (resource_id),
    CONSTRAINT fk_resource_chunks_resource_id FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: access_logs
-- Purpose: Audit log tracking read-only viewing sessions (No downloads allowed)
-- ----------------------------------------------------------------------------
CREATE TABLE access_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    resource_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NULL DEFAULT NULL,
    user_agent VARCHAR(512) NULL DEFAULT NULL,
    accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_access_logs_user_id (user_id),
    KEY idx_access_logs_resource_id (resource_id),
    KEY idx_access_logs_accessed_at (accessed_at),
    KEY idx_access_logs_resource_time (resource_id, accessed_at),
    KEY idx_access_logs_user_time (user_id, accessed_at),
    CONSTRAINT fk_access_logs_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_access_logs_resource_id FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: feedback
-- Purpose: Replaces live chat with structured troubleshooting and resource requests
-- ----------------------------------------------------------------------------
CREATE TABLE feedback (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    category ENUM('suggestion', 'problem', 'missing_resource', 'improvement') NOT NULL DEFAULT 'suggestion',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
    admin_response TEXT NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_feedback_user_id (user_id),
    KEY idx_feedback_status_created (status, created_at),
    KEY idx_feedback_created_at (created_at),
    CONSTRAINT fk_feedback_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: notifications
-- Purpose: Librarian broadcast system for announcements and new asset promotions
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NULL DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'announcement',
    created_by BIGINT UNSIGNED NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_notifications_resource_id (resource_id),
    KEY idx_notifications_created_by (created_by),
    KEY idx_notifications_type (type),
    KEY idx_notifications_created_at (created_at),
    CONSTRAINT fk_notifications_resource_id FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table: notification_users
-- Purpose: Pivot table documenting individual broadcast receipt and read status
-- ----------------------------------------------------------------------------
CREATE TABLE notification_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    notification_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    read_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_notification_user (notification_id, user_id),
    KEY idx_notification_users_notification_id (notification_id),
    KEY idx_notification_users_user_id (user_id),
    KEY idx_notification_users_read_at (read_at),
    KEY idx_notification_users_user_read (user_id, read_at),
    CONSTRAINT fk_notification_users_notification_id FOREIGN KEY (notification_id) REFERENCES notifications (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notification_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Table: ai_chat_history
-- Purpose: Retains conversational turns and document citations for AI assistant
-- ----------------------------------------------------------------------------
CREATE TABLE ai_chat_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    session_id VARCHAR(36) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    citations JSON NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ai_chat_session_id (session_id),
    KEY idx_ai_chat_user_id (user_id),
    KEY idx_ai_chat_created_at (created_at),
    KEY idx_ai_chat_user_session_time (user_id, session_id, created_at),
    CONSTRAINT fk_ai_chat_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
