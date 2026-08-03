-- ============================================
-- SSGI Digital Library — Sample Data
-- ============================================

-- Users
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Admin User',     'admin@ssgi.edu',    '$2y$10$hashedpassword1', 'admin',     NOW(), NOW()),
('Librarian One',  'lib@ssgi.edu',      '$2y$10$hashedpassword2', 'librarian', NOW(), NOW()),
('Abebe Kebede',   'abebe@ssgi.edu',    '$2y$10$hashedpassword3', 'student',   NOW(), NOW()),
('Tigist Alemu',   'tigist@ssgi.edu',   '$2y$10$hashedpassword4', 'student',   NOW(), NOW()),
('Dawit Hailu',    'dawit@ssgi.edu',    '$2y$10$hashedpassword5', 'student',   NOW(), NOW());

-- Books
INSERT INTO books (title, author, isbn, category, quantity, available, created_at, updated_at) VALUES
('Introduction to Algorithms',       'Cormen et al.',     '978-0262033848', 'Computer Science', 5, 3, NOW(), NOW()),
('Clean Code',                        'Robert C. Martin',  '978-0132350884', 'Software Engineering', 3, 2, NOW(), NOW()),
('The Pragmatic Programmer',          'Hunt & Thomas',     '978-0201616224', 'Software Engineering', 4, 4, NOW(), NOW()),
('Database System Concepts',          'Silberschatz et al.','978-0073523323', 'Database',         6, 5, NOW(), NOW()),
('Computer Networks',                 'Tanenbaum',         '978-0132126953', 'Networking',        4, 3, NOW(), NOW()),
('Artificial Intelligence: A Modern Approach', 'Russell & Norvig', '978-0136042594', 'AI/ML', 3, 1, NOW(), NOW());

-- Borrows
INSERT INTO borrows (user_id, book_id, borrowed_at, due_at, returned_at, status) VALUES
(3, 1, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), NULL,  'borrowed'),
(3, 2, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), NULL,  'borrowed'),
(4, 4, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), NULL,  'borrowed'),
(5, 6, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), NULL,  'borrowed'),
(3, 3, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'returned');
