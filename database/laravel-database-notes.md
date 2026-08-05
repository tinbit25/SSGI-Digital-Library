# Laravel 12 Backend Database Architecture & Implementation Guide
**Project:** SSGI Digital Library Portal (with AI RAG Assistant Integration)  
**Target Engine:** MySQL 8.0+ / InnoDB  
**Scope:** Architectural guidance, Eloquent naming compatibility, migration structuring, and relationship mapping for Laravel backend developers.

---

## 1. Comprehensive Schema Review (Laravel & Eloquent Perspective)

This review audits the database design against standard **Laravel 12** and **Eloquent ORM** conventions, identifying zero-configuration automated bindings as well as specific customizations required during implementation.

### 1.1 Table Names vs. Laravel Naming Conventions
In standard Laravel architecture, model class names are singular PascalCase while table names are plural snake_case. 
* **Automatic Convention Compliance (No customization needed):**
  * `Role` model → `roles` table (Complies with Spatie Permission RBAC structure).
  * `User` model → `users` table (Standard Laravel Authentication framework).
  * `Category` model → `categories` table (Eloquent automatic pluralization correctly resolves this).
  * `Resource` model → `resources` table (Native binding).  
    * *Developer Warning:* Ensure you import your application model (`App\Models\Resource`) in controllers rather than Laravel's HTTP API wrapper (`Illuminate\Http\Resources\Json\JsonResource`).
  * `ResourceChunk` model → `resource_chunks` table (Native automatic mapping).
  * `AccessLog` model → `access_logs` table (Native automatic mapping).
  * `Feedback` model → `feedback` table (In English grammar and Laravel's pluralizer string helper, "feedback" is an uncountable noun; `Str::plural('feedback')` returns `'feedback'`. No model table override needed).
  * `Notification` model → `notifications` table (Native binding for custom broadcasting entities).

* **Required Explicit Naming Overrides in Models:**
  * **`AiChatHistory` model:** Eloquent’s default string pluralizer will look for a table named `ai_chat_histories`. Since our approved schema uses the collective singular noun table name `ai_chat_history`, the model must declare an explicit override:  
    * *Guidance:* Declare `protected $table = 'ai_chat_history';` inside the `AiChatHistory` model.
  * **`notification_users` table:** In strict Eloquent alphabetical singular naming, a many-to-many pivot table between notifications and users would be `notification_user`. Since our schema utilizes the plural `notification_users`, any `belongsToMany` relationship definition must explicitly specify the second argument (the custom table name) or utilize a dedicated intermediate Eloquent Pivot model (`NotificationUser`) with an explicit table attribute.

---

### 1.2 Foreign Keys vs. Eloquent Relationship Binding
Laravel expects foreign key columns to follow the pattern `{singular_target_table}_id`, referencing the primary key `id` on the target parent table.
* **Standard Automated Foreign Keys:**
  * `role_id` on `users`, `category_id` on `resources`, `resource_id` on `resource_chunks`, `user_id` & `resource_id` on `access_logs`, `user_id` on `feedback`, `resource_id` on `notifications`, and `notification_id` & `user_id` on `notification_users`. All resolve immediately without custom foreign key arguments in Eloquent relationships.
* **Custom Foreign Key Declarations Required:**
  * **`parent_id` on `categories`:** Self-referential hierarchy. Requires passing `'parent_id'` as the custom foreign key parameter when defining both parent and children relationships in the `Category` model.
  * **`uploaded_by` on `resources`:** Links to `users.id`. Since the column name differs from `user_id` to describe semantic ownership, passing `'uploaded_by'` as the custom foreign key parameter is mandatory in both the `Resource` (author) and `User` (uploaded resources) models.
  * **`created_by` on `notifications`:** Links to `users.id` (the publishing librarian). Requires passing `'created_by'` as the custom foreign key parameter.

---

### 1.3 Timestamps & Soft Deletes Compatibility
* **Standard Automated Timestamps (`created_at`, `updated_at`):**
  * Present across `roles`, `users`, `categories`, `resources`, `resource_chunks`, `feedback`, and `notifications`. In all corresponding Eloquent models, leave timestamp automation enabled (default behavior).
* **Soft Deletes Trait Integration (`deleted_at`):**
  * Present on `users`, `categories`, and `resources`.
  * *Guidance:* Integrate the Eloquent SoftDeletes trait inside these three models to ensure records are cleanly hidden from API responses without breaking immutable historical read audit logs or RAG citation integrity.
* **Custom Timestamp Configurations (Immutable & Event Ledger Tables):**
  * **`access_logs`:** Represents an immutable reading audit trail and contains only an `accessed_at` timestamp column (no `updated_at` or `created_at`).  
    * *Guidance:* Disable default timestamps in the `AccessLog` model (`public $timestamps = false;`) or customize the creation timestamp constant (`const CREATED_AT = 'accessed_at';`) while setting the update timestamp constant to null.
  * **`ai_chat_history`:** Immutably records spoken AI and user conversation turns using only `created_at`.  
    * *Guidance:* Keep timestamps enabled in the `AiChatHistory` model, but explicitly nullify the update timestamp constant (`const UPDATED_AT = null;`).
  * **`notification_users`:** Contains a custom `read_at` timestamp representing read-receipt fulfillment. When accessing through pivot queries, ensure `read_at` is registered in timestamp/date casting definitions.

---

### 1.4 Nullable Fields Strategy & Business Rationale
All nullable column definitions in the MySQL schema reflect precise domain rules and API handling behaviors:
* **`users.email_verified_at` & `users.remember_token`:** Standard optional authentication parameters for onboarding and API session persistency.
* **`categories.parent_id`:** Nullable to allow top-level root domains (e.g., GIS, Remote Sensing). Configured with `ON DELETE SET NULL` so that if a parent domain is removed, subcategories become independent root categories rather than cascading to deletion.
* **`resources.abstract`, `file_size_bytes`, & `page_count`:** Nullable to permit initial metadata seeding before document background extraction jobs compute page totals and binary file dimensions.
* **`access_logs.ip_address` & `user_agent`:** Nullable to ensure zero logging failures during internal system audit checks, CLI API test executions, or background automated reading link validation where HTTP header variables are absent.
* **`feedback.admin_response`:** Must remain null while a user ticket resides in `pending` or `under_review` statuses until an administrator formally resolves the ticket.
* **`notifications.resource_id` & `created_by`:** Both nullable with `ON DELETE SET NULL`. Allows broadcast alerts to operate as global administrative system announcements (unbound to specific books) and protects broadcast histories from vanishing if an uploading librarian's user account is purged.
* **`notification_users.read_at`:** Acts as a dual-state indicator. A null value represents an unread notification, directly driving the API unread badge counter query.
* **`ai_chat_history.citations`:** Nullable JSON attribute. Remains null during general AI conversation or greeting exchanges where specific library document text chunks are not invoked as evidence.

---

### 1.5 Indexing Strategy for High-Performance API Execution
The schema includes robust indexing optimized for high-throughput API endpoints:
* **Unique Constraints (UK):**
  * Protected identifiers (`users.email`, `resources.uuid`, `categories.slug`).
  * Deduplication & RAG integrity (`resources.file_hash`, `resource_chunks.vector_id`, and the composite unique binding on `[resource_id, chunk_index]`).
  * Pivot deduplication (`[notification_id, user_id]` on broadcast receipt items).
* **Composite Performance Indexes (Designed for specific API WHERE/ORDER clauses):**
  * **`idx_resources_published_created (is_published, created_at)`:** Powers instantaneous catalog discovery feeds (`WHERE is_published = 1 ORDER BY created_at DESC`).
  * **`idx_resource_page (resource_id, page_number)`:** Allows instant reader navigation jumping and text snippet highlighting when an AI footnote citation points to a physical document page.
  * **`idx_access_logs_resource_time (resource_id, accessed_at)` & `(user_id, accessed_at)`:** Accelerates analytics dashboards and user reading tracking without triggering full table scans.
  * **`idx_feedback_status_created (status, created_at)`:** Optimizes administrative support ticket sorting by processing priority.
  * **`idx_notification_users_user_read (user_id, read_at)`:** Delivers sub-millisecond calculation of unread notification badge counters in navbar header APIs (`WHERE user_id = ? AND read_at IS NULL`).
  * **`idx_ai_chat_user_session_time (user_id, session_id, created_at)`:** Guarantees instant conversation history assembly when loading active RAG chat windows.

---

## 2. Recommended Laravel Migrations Architecture

When creating migrations using the Artisan CLI, enforce the exact execution order listed below to prevent foreign key dependency reference failures during schema execution.

### 2.1 Chronological Migration Order
1. `create_roles_table`
2. `create_users_table`
3. `create_categories_table`
4. `create_resources_table`
5. `create_resource_chunks_table`
6. `create_access_logs_table`
7. `create_feedback_table`
8. `create_notifications_table`
9. `create_notification_users_table`
10. `create_ai_chat_history_table`

---

### 2.2 Table Migration Structural Specifications

#### 1. Roles Table Migration
* Define auto-incrementing BigInt primary key (`id`).
* String column for `name` and `guard_name` (defaulting to string literal 'web').
* Enable standard timestamps (`created_at`, `updated_at`).
* Apply composite unique index across `[name, guard_name]` and simple index on `name`.

#### 2. Users Table Migration
* Define primary key (`id`).
* Add foreign key constraint for `role_id` referencing `id` on `roles` table with `onDelete('restrict')` and `onUpdate('cascade')` rules.
* Define strings for `name`, unique `email`, and `password`.
* Include nullable timestamp for `email_verified_at` and token column for `remember_token`.
* Enable standard timestamps and soft deletes timestamp (`deleted_at`).
* Apply simple performance indexes on `role_id`, `created_at`, and `deleted_at`.

#### 3. Categories Table Migration
* Define primary key (`id`).
* Define nullable foreign key constraint for `parent_id` referencing `id` on the identical `categories` table with `onDelete('set null')` rule.
* Define strings for `name` and unique `slug`, plus nullable text for `description`.
* Enable standard timestamps and soft deletes timestamp.
* Apply performance indexes on `parent_id`, `name`, and `deleted_at`.

#### 4. Resources Table Migration
* Define primary key (`id`).
* Add string column for `uuid` (length 36, configured as unique).
* Define foreign key constraints for `category_id` referencing `categories` and `uploaded_by` referencing `users`, both configured with `onDelete('restrict')`.
* Define strings for `title`, `author`, `file_path` (length 512), and unique `file_hash` (length 64).
* Add nullable text for `abstract`, and nullable unsigned integers for `file_size_bytes` and `page_count`.
* Add boolean flag for `is_published` (defaulting to true/1).
* Enable standard timestamps and soft deletes timestamp.
* Apply individual performance indexes on `title`, `category_id`, `uploaded_by`, `deleted_at`, and a composite performance index on `[is_published, created_at]`.

#### 5. Resource Chunks Table Migration (AI RAG Bridge)
* Define primary key (`id`).
* Add foreign key constraint for `resource_id` referencing `resources` with `onDelete('cascade')` rule (deleting a literature item must obliterate all extracted RAG database chunks).
* Define unsigned integer for `chunk_index`, unsigned integer for `page_number` (enabling online reader jumping), medium text column for `chunk_text`, and unique string for `vector_id` (length 255).
* Enable standard timestamps.
* Apply a composite unique constraint across `[resource_id, chunk_index]`, composite index across `[resource_id, page_number]`, and simple index on `resource_id`.

#### 6. Access Logs Table Migration (Read-Only Security Auditing)
* Define primary key (`id`).
* Add foreign key constraints for `user_id` referencing `users` and `resource_id` referencing `resources`, both with `onDelete('cascade')` rules.
* Add nullable string columns for `ip_address` (length 45) and `user_agent` (length 512).
* Add a single non-nullable timestamp for `accessed_at` defaulting to current timestamp (do not invoke standard timestamps method).
* Apply individual indexes on `user_id`, `resource_id`, and `accessed_at`, plus composite performance indexes on `[resource_id, accessed_at]` and `[user_id, accessed_at]`.

#### 7. Feedback Table Migration (Structured Ticketing)
* Define primary key (`id`).
* Add foreign key constraint for `user_id` referencing `users` with `onDelete('cascade')`.
* Define enumeration column for `category` with permitted values (`suggestion`, `problem`, `missing_resource`, `improvement`), defaulting to `suggestion`.
* Define string for `subject` and text column for `message`.
* Define enumeration column for `status` with permitted values (`pending`, `under_review`, `resolved`, `dismissed`), defaulting to `pending`.
* Add nullable text for `admin_response`.
* Enable standard timestamps.
* Apply individual indexes on `user_id` and `created_at`, plus a composite performance index on `[status, created_at]`.

#### 8. Notifications Table Migration
* Define primary key (`id`).
* Add nullable foreign key constraints for `resource_id` referencing `resources` and `created_by` referencing `users`, both with `onDelete('set null')`.
* Define string for `title`, text for `message`, and string for `type` (length 50, defaulting to 'announcement').
* Enable standard timestamps.
* Apply individual indexes on `resource_id`, `created_by`, `type`, and `created_at`.

#### 9. Notification Users Table Migration (Broadcast Pivot)
* Define primary key (`id`).
* Add foreign key constraints for `notification_id` referencing `notifications` and `user_id` referencing `users`, both with `onDelete('cascade')`.
* Add nullable timestamp for `read_at` (do not invoke standard timestamps method).
* Apply unique constraint across `[notification_id, user_id]`.
* Apply simple indexes on `notification_id`, `user_id`, and `read_at`, plus a composite performance index on `[user_id, read_at]`.

#### 10. AI Chat History Table Migration (RAG Citations)
* Define primary key (`id`).
* Add string for `session_id` (length 36).
* Add foreign key constraint for `user_id` referencing `users` with `onDelete('cascade')`.
* Add string for `role` (length 20, identifying user vs. assistant turns), text column for `message`, and nullable JSON attribute for `citations`.
* Add single non-nullable timestamp for `created_at` defaulting to current timestamp.
* Apply individual indexes on `session_id`, `user_id`, and `created_at`, plus a composite performance index on `[user_id, session_id, created_at]`.

---

## 3. Recommended Eloquent Model Relationships

Below are the comprehensive relationship definitions that backend developers should incorporate into each application model.

### 3.1 Role Model (`App\Models\Role`)
* **`users()`**: Has Many relationship targeting `User` model. Represents all staff, librarians, and trainees assigned to this specific permission tier.

### 3.2 User Model (`App\Models\User`)
* **`role()`**: Belongs To relationship targeting `Role` model via `role_id`.
* **`uploadedResources()`**: Has Many relationship targeting `Resource` model using custom foreign key `uploaded_by`.
* **`accessLogs()`**: Has Many relationship targeting `AccessLog` model via `user_id`. Retrieves all online document reading audit events for this user.
* **`feedback()`**: Has Many relationship targeting `Feedback` model via `user_id`.
* **`createdNotifications()`**: Has Many relationship targeting `Notification` model using custom foreign key `created_by`. Represents broadcasts authored by an administrator or librarian.
* **`notifications()`**: Belongs To Many (Many-to-Many) relationship targeting `Notification` model utilizing custom pivot table `notification_users`.  
  * *Required Modifiers:* Must append pivot attribute inclusion for `read_at`, along with unique ID binding.
* **`aiChatHistories()`**: Has Many relationship targeting `AiChatHistory` model via `user_id`.

### 3.3 Category Model (`App\Models\Category`)
* **`parent()`**: Belongs To self-referential relationship targeting `Category` model using custom foreign key `parent_id`. Retrieves immediate super-category.
* **`children()`**: Has Many self-referential relationship targeting `Category` model using custom foreign key `parent_id`. Retrieves immediate sub-domain divisions.
* **`resources()`**: Has Many relationship targeting `Resource` model via `category_id`.
* **`allResources()` (Advanced Scope/Relationship):** Has Many Through or recursive query builder scope targeting all resources nested within this category and all its children.

### 3.4 Resource Model (`App\Models\Resource`)
* **`category()`**: Belongs To relationship targeting `Category` model via `category_id`.
* **`uploader()`**: Belongs To relationship targeting `User` model using custom foreign key `uploaded_by`.
* **`chunks()`**: Has Many relationship targeting `ResourceChunk` model via `resource_id`. Links document catalog records directly to their natural language text extraction slices for AI processing.
* **`accessLogs()`**: Has Many relationship targeting `AccessLog` model via `resource_id`. Retrieves all reading tracking records for popularity and analytics scoring.
* **`notifications()`**: Has Many relationship targeting `Notification` model via `resource_id`. Retrieves announcement alerts generated to advertise this specific document.

### 3.5 ResourceChunk Model (`App\Models\ResourceChunk`)
* **`resource()`**: Belongs To relationship targeting `Resource` model via `resource_id`.
* *RAG Integration Note:* While `vector_id` holds a string matching an external Qdrant Vector Database point, do not attempt to map an Eloquent database relationship to it; vector similarity lookups pass through a dedicated external Qdrant HTTP client service in Laravel, which subsequently fetches matching chunks using `ResourceChunk::whereIn('vector_id', $ids)->get()`.

### 3.6 AccessLog Model (`App\Models\AccessLog`)
* **`user()`**: Belongs To relationship targeting `User` model via `user_id`.
* **`resource()`**: Belongs To relationship targeting `Resource` model via `resource_id`.

### 3.7 Feedback Model (`App\Models\Feedback`)
* **`user()`**: Belongs To relationship targeting `User` model via `user_id`. Identifies the staff member or trainee who originally submitted the support request or document recommendation.

### 3.8 Notification Model (`App\Models\Notification`)
* **`resource()`**: Belongs To nullable relationship targeting `Resource` model via `resource_id`. Returns the associated digital catalog document if the notification is a promotional release alert.
* **`author()`**: Belongs To nullable relationship targeting `User` model using custom foreign key `created_by`. Returns the librarian account that authored the notification.
* **`recipients()`**: Belongs To Many relationship targeting `User` model utilizing custom pivot table `notification_users`.  
  * *Required Modifiers:* Include pivot attribute binding for `read_at` to evaluate unread vs. read receipt compliance per account.

### 3.9 AiChatHistory Model (`App\Models\AiChatHistory`)
* **`user()`**: Belongs To relationship targeting `User` model via `user_id`.
* *Citations Attribute Casting Note:* In model attribute casting, configure the `citations` column to cast to standard array or collection types (`'citations' => 'array'`) so the AI RAG engine can seamlessly parse cited document UUIDs, physical page numbers (`page_number`), and matching vector point IDs directly into JSON responses for frontend reader rendering.
