-- ============================================================================
-- SSGI Digital Library Portal — Sample Data for Backend API Testing & Development
-- Target Engine: MySQL 8.0+ / InnoDB (Laravel 12 / Eloquent ORM Compatible)
-- Purpose: Provides predictable, comprehensive test fixtures across all tables
--          to facilitate API endpoint testing, RBAC permission auditing,
--          pagination testing, RAG vector integration, and unread badge counters.
-- ============================================================================

USE ssgi_digital_library;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data before seeding test database
TRUNCATE TABLE ai_chat_history;
TRUNCATE TABLE resource_chunks;
TRUNCATE TABLE notification_users;
TRUNCATE TABLE notifications;
TRUNCATE TABLE feedback;
TRUNCATE TABLE access_logs;
TRUNCATE TABLE resources;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Roles Table (Spatie Permission & RBAC Tier Testing)
-- Backend API Testing: Test endpoints restricted by middleware ('role:Administrator|Librarian')
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, name, guard_name, created_at, updated_at) VALUES
(1, 'Administrator', 'web', NOW(), NOW()),
(2, 'Librarian',     'web', NOW(), NOW()),
(3, 'Staff',         'web', NOW(), NOW()),
(4, 'Guest',         'web', NOW(), NOW());

-- ----------------------------------------------------------------------------
-- 2. Users Table (Authentication, Token & Role Verification)
-- Note: All test accounts share the standard bcrypt hash for password: 'password'
-- ($2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
-- Backend API Testing: Use these email/password combinations for POST /api/login and JWT/Sanctum testing.
-- ----------------------------------------------------------------------------
INSERT INTO users (id, role_id, name, email, email_verified_at, password, created_at, updated_at) VALUES
(1, 1, 'Dr. Solomon Belay (Admin)',     'admin@ssgi.gov.et',          NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
(2, 2, 'Tigist Alemu (Librarian)',      'librarian@ssgi.gov.et',      NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
(3, 3, 'Abebe Kebede (GIS Staff)',      'abebe.gis@ssgi.gov.et',      NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
(4, 3, 'Hiwot Desta (Remote Sensing)',  'hiwot.rs@ssgi.gov.et',       NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
(5, 4, 'Dawit Hailu (Guest Trainee)',   'guest.trainee@ssgi.gov.et',  NOW(), '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- ----------------------------------------------------------------------------
-- 3. Categories Table (Taxonomy & Filtering API Testing)
-- Backend API Testing: Test GET /api/categories and GET /api/resources?category_slug=gis
-- ----------------------------------------------------------------------------
INSERT INTO categories (id, parent_id, name, slug, description, created_at, updated_at) VALUES
(1, NULL, 'GIS',                   'gis',                   'Geographic Information Systems vector/raster datasets, geodatabase modeling, and spatial analysis techniques.', NOW(), NOW()),
(2, NULL, 'Remote Sensing',        'remote-sensing',        'Earth observation imagery, multispectral processing, LiDAR radar analysis, and atmospheric correction.', NOW(), NOW()),
(3, NULL, 'Satellite Technology',  'satellite-technology',  'CubeSat engineering, orbital dynamics, telemetry command systems, and ETRSS flight operations.', NOW(), NOW()),
(4, NULL, 'Geospatial Science',    'geospatial-science',    'Geodesy, geopotential gravity field modeling, coordinate datum calibration, and survey standards.', NOW(), NOW()),
(5, NULL, 'Training Materials',    'training-materials',    'Practical step-by-step lab manuals, software bootcamps, and institutional curriculum workbooks for trainees.', NOW(), NOW());

-- ----------------------------------------------------------------------------
-- 4. Resources Table (Catalog Discovery & Read-Only Stream Authentication)
-- Backend API Testing:
--   - Test published vs unpublished visibility (GET /api/resources should exclude is_published = 0 for normal users)
--   - Test search queries (GET /api/resources?search=Sentinel)
--   - Test stream endpoint access using UUIDs (GET /api/resources/stream/{uuid})
-- ----------------------------------------------------------------------------
INSERT INTO resources (id, uuid, category_id, title, author, abstract, file_path, file_hash, file_size_bytes, page_count, is_published, uploaded_by, created_at, updated_at) VALUES
(1, 'a1111111-1b1b-1c1c-1d1d-111111111111', 1, 'National Spatial Data Infrastructure (NSDI) Framework & Geodatabase Guidelines', 'Geospatial Standards Taskforce', 'Technical protocol for national spatial database standardization, topological rules, and metadata structures across regional bureaus.', 'private/resources/2026/08/nsdi_geodatabase_guidelines.pdf', 'a1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900112233445566', 5420100, 84, 1, 2, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 'b2222222-2b2b-2c2c-2d2d-222222222222', 2, 'Sentinel-2 & Landsat 9 Agricultural Drought Assessment across East Africa', 'Hiwot Desta & Dr. M. Tadesse', 'Comparative evaluation of NDVI, EVI, and NDWI spectral drought vegetation indices using Google Earth Engine and cloud-free composites.', 'private/resources/2026/08/sentinel_landsat_drought_assessment.pdf', 'b1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900112233445577', 14250800, 62, 1, 2, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(3, 'c3333333-3b3b-3c3c-3d3d-333333333333', 3, 'ETRSS-1 & ETRSS-2 CubeSat Architecture & Ground Station Telemetry Manual', 'SSGI Satellite Engineering Team', 'Complete command structural breakdown and RF link telemetry specifications for tracking antenna controllers at the Entoto ground station.', 'private/resources/2026/08/etrss_telemetry_manual.pdf', 'c1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900112233445588', 18900400, 128, 1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(4, 'd4444444-4b4b-4c4c-4d4d-444444444444', 4, 'Advanced Geodetic Reference Frames & Gravity Anomaly Modeling in Ethiopia', 'Astronomy & Geodesy Department', 'Mathematical transformations linking local geodetic datums to global ITRF coordinates, incorporating regional Bouguer gravity models.', 'private/resources/2026/08/geodesy_reference_frames.pdf', 'd1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900112233445599', 7620400, 95, 1, 2, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(5, 'e5555555-5b5b-5c5c-5d5d-555555555555', 5, 'QGIS and Google Earth Engine Practical Bootcamp Cookbook for SSGI Trainees', 'SSGI Capacity Building Division', 'Step-by-step lab exercises covering raster georeferencing, vector terrain analysis, automated land cover classification, and cartographic layout styling.', 'private/resources/2026/08/qgis_gee_bootcamp_cookbook.pdf', 'e1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900112233445500', 25600900, 150, 1, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(6, 'f6666666-6b6b-6c6c-6d6d-666666666666', 5, 'DRAFT: AI RAG System Usage Policy and Document Ingestion Protocol', 'Dr. Solomon Belay', 'Internal instructions for preparing PDF files for vector embedding extraction and text chunk segmentation. Currently undergoing editorial review.', 'private/resources/2026/08/draft_rag_ingestion_protocol.pdf', 'f1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900112233445511', 2100400, 18, 0, 1, NOW(), NOW());

-- ----------------------------------------------------------------------------
-- 5. Access Logs Table (Auditing Read-Only Document View Sessions)
-- Backend API Testing:
--   - Test reading audit trails and statistical aggregations (GET /api/analytics/most-viewed-resources)
--   - Test security filtering by IP or user agent
-- ----------------------------------------------------------------------------
INSERT INTO access_logs (user_id, resource_id, ip_address, user_agent, accessed_at) VALUES
(3, 1, '197.156.92.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, '197.156.92.20', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0.0.0 Safari/537.36', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 3, '197.156.92.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 5, '197.156.88.45', 'Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 3, '197.156.92.20', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4, '197.156.92.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36', NOW());

-- ----------------------------------------------------------------------------
-- 6. Feedback Table (Structured Support Tickets Replacing Real-time Chat)
-- Backend API Testing:
--   - Test filtering by status and category (GET /api/feedback?status=pending&category=problem)
--   - Test Librarian/Admin resolution updates (PATCH /api/feedback/{id} -> update status and admin_response)
-- ----------------------------------------------------------------------------
INSERT INTO feedback (user_id, category, subject, message, status, admin_response, created_at, updated_at) VALUES
(3, 'missing_resource', 'Request for 2025 African Space Policy Colloquium Papers', 'We need the published digital proceedings from the regional symposium to assist our regional spatial planning project.', 'under_review', 'We have contacted the organizers for the official digital release. Expect upload within 3 business days.', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'problem', 'ETRSS-2 Manual Section 4 Formula Rendering Glitch', 'When streaming the PDF via mobile browsers on iOS, the mathematical equations on page 94 appear slightly garbled.', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(5, 'suggestion', 'Add bookmarking feature to online document reader', 'It would be helpful if the streaming reader saved our last viewed page number between login sessions.', 'resolved', 'Feature has been added to the Q3 Frontend development roadmap.', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 'improvement', 'Enhance search syntax to support exact phrase matching with quotes', 'When querying multi-word satellite names, exact quote matching would reduce false positive results.', 'dismissed', 'Current RediSearch/Qdrant configuration already supports boolean quoting; training documentation updated.', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ----------------------------------------------------------------------------
-- 7. Notifications Table (Broadcast Announcements & Catalog Promotions)
-- Backend API Testing: Test announcement feeds and resource promotions
-- ----------------------------------------------------------------------------
INSERT INTO notifications (id, resource_id, title, message, type, created_by, created_at, updated_at) VALUES
(1, 3, 'New Resource Available: ETRSS CubeSat Telemetry Manual', 'The comprehensive satellite architecture and flight command reference has been officially published to the library.', 'new_resource', 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, NULL, 'Scheduled RAG Engine Maintenance Notice', 'The AI Library Assistant semantic database will undergo index maintenance on Friday between 01:00 and 03:00 AM EAT.', 'announcement', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 5, 'New Training Workbook: QGIS & Google Earth Engine Bootcamp', 'Attention all GIS trainees: The new lab practical manual is now live in the Training Materials catalog for your exercises.', 'new_resource', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ----------------------------------------------------------------------------
-- 8. Notification Users Table (Pivot Read Receipt & Unread Badge Counter)
-- Backend API Testing:
--   - Test unread counters for authenticated users (GET /api/user/notifications/unread-count)
--     * User 3 (Abebe) has 1 unread notification (ID 3)
--     * User 4 (Hiwot) has 1 unread notification (ID 3)
--     * User 5 (Dawit/Trainee) has 2 unread notifications (IDs 2 & 3)
--   - Test marking read (PATCH /api/notifications/{id}/read)
-- ----------------------------------------------------------------------------
INSERT INTO notification_users (notification_id, user_id, read_at) VALUES
(1, 3, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 4, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 5, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 3, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 4, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 5, NULL), -- Unread for Trainee
(3, 3, NULL), -- Unread for GIS Staff
(3, 4, NULL), -- Unread for Remote Sensing Staff
(3, 5, NULL); -- Unread for Trainee

-- ----------------------------------------------------------------------------
-- 9. Resource Chunks Table (RAG Text Slices & Qdrant Vector DB Mapping)
-- Backend API Testing:
--   - Test retrieving chunks by resource (GET /api/resources/{id}/chunks)
--   - Test resolving Qdrant vector hits back to MySQL content during LLM context building
-- ----------------------------------------------------------------------------
INSERT INTO resource_chunks (resource_id, chunk_index, content, qdrant_vector_id, created_at, updated_at) VALUES
(3, 0, 'Section 1: ETRSS Telemetry Framing. Downlink transmission from ETRSS operates in X-band frequency at 8.2 GHz employing QPSK modulation with packet structures strictly adhering to CCSDS standards.', 'qdr_vec_etrss_chunk_00', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 1, 'Section 2: Orbital Mechanics & Ground Sampling Distance. The multi-spectral camera payload captures Earth imagery with a nadir Ground Sampling Distance (GSD) of 13.75 meters across four visible and near-infrared spectral bands.', 'qdr_vec_etrss_chunk_01', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 0, 'Chapter 1: Drought Spectral Indices. Agricultural moisture anomalies in Oromia and East Shewa were quantified by contrasting Level-2A surface reflectance temporal NDVI curves against historical 10-year baselines.', 'qdr_vec_drought_chunk_00', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 0, 'Module 1: Automated NDVI Processing in GEE. To initiate interactive geospatial cloud processing, instantiate an ee.ImageCollection for COPERNICUS/S2_SR and apply cloud masking using the QA60 bitmask layer.', 'qdr_vec_gee_chunk_00', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ----------------------------------------------------------------------------
-- 10. AI Chat History Table (Conversational Turns & RAG Document Citations)
-- Backend API Testing: Test retrieving session history with structured JSON citation arrays
-- (GET /api/ai/chat/history?session_id=77777777-a1a1-b2b2-c3c3-888888888888)
-- ----------------------------------------------------------------------------
INSERT INTO ai_chat_history (session_id, user_id, role, message, citations, created_at) VALUES
('77777777-a1a1-b2b2-c3c3-888888888888', 4, 'user', 'What frequency band and modulation scheme does ETRSS use for downlink telemetry transmission?', NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('77777777-a1a1-b2b2-c3c3-888888888888', 4, 'assistant', 'According to the ETRSS CubeSat Telemetry Manual, the downlink transmission operates in the X-band frequency at 8.2 GHz, employing QPSK modulation with packet structures conforming to CCSDS protocol standards.', '{"resources": [{"id": 3, "uuid": "c3333333-3b3b-3c3c-3d3d-333333333333", "title": "ETRSS-1 & ETRSS-2 CubeSat Architecture & Ground Station Telemetry Manual", "matched_chunk_indices": [0], "qdrant_point_ids": ["qdr_vec_etrss_chunk_00"]}]}', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('77777777-a1a1-b2b2-c3c3-888888888888', 3, 'user', 'How do I perform cloud masking on Sentinel-2 datasets in Google Earth Engine?', NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('77777777-a1a1-b2b2-c3c3-888888888888', 3, 'assistant', 'In Google Earth Engine, when processing the COPERNICUS/S2_SR surface reflectance ImageCollection, you can achieve automated cloud masking by filtering pixels using the QA60 bitmask band to remove opaque clouds and cirrus formations before computing vegetation indices.', '{"resources": [{"id": 5, "uuid": "e5555555-5b5b-5c5c-5d5d-555555555555", "title": "QGIS and Google Earth Engine Practical Bootcamp Cookbook for SSGI Trainees", "matched_chunk_indices": [0], "qdrant_point_ids": ["qdr_vec_gee_chunk_00"]}]}', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- End of sample data script
