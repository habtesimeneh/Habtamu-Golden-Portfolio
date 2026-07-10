-- =====================================================================
-- DATABASE SCHEMA & SEED DATA FOR HABTAMU SIMENEH GOLD PORTFOLIO CMS
-- Designed for MAMP, XAMPP, MySQL Server & Free Cloud MySQL Hosts
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `habtamu_gold_portfolio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `habtamu_gold_portfolio`;

-- ---------------------------------------------------------------------
-- DROP EXISTING TABLES (IN REVERSE ORDER OF FOREIGN KEYS)
-- ---------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `resume`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `gallery`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `blogs`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `experience`;
DROP TABLE IF EXISTS `education`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- TABLE: users
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(150) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: projects
-- ---------------------------------------------------------------------
CREATE TABLE `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image_url` TEXT DEFAULT NULL,
  `github_link` TEXT DEFAULT NULL,
  `live_link` TEXT DEFAULT NULL,
  `featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: skills
-- ---------------------------------------------------------------------
CREATE TABLE `skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `percentage` INT NOT NULL CHECK (`percentage` >= 0 AND `percentage` <= 100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: education
-- ---------------------------------------------------------------------
CREATE TABLE `education` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `institution` VARCHAR(255) NOT NULL,
  `degree` VARCHAR(150) NOT NULL,
  `field_of_study` VARCHAR(150) NOT NULL,
  `start_date` VARCHAR(50) NOT NULL,
  `end_date` VARCHAR(50) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: experience
-- ---------------------------------------------------------------------
CREATE TABLE `experience` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company` VARCHAR(255) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `start_date` VARCHAR(50) NOT NULL,
  `end_date` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: services
-- ---------------------------------------------------------------------
CREATE TABLE `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: testimonials
-- ---------------------------------------------------------------------
CREATE TABLE `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_name` VARCHAR(150) NOT NULL,
  `client_role` VARCHAR(150) NOT NULL,
  `client_company` VARCHAR(150) DEFAULT NULL,
  `feedback` TEXT NOT NULL,
  `avatar_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: blogs
-- ---------------------------------------------------------------------
CREATE TABLE `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image_url` TEXT DEFAULT NULL,
  `views` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: messages
-- ---------------------------------------------------------------------
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_name` VARCHAR(150) NOT NULL,
  `sender_email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(255) DEFAULT 'No Subject',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: gallery
-- ---------------------------------------------------------------------
CREATE TABLE `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `image_url` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: certificates
-- ---------------------------------------------------------------------
CREATE TABLE `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `issuer` VARCHAR(255) NOT NULL,
  `issue_date` VARCHAR(100) NOT NULL,
  `credential_url` TEXT DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: resume
-- ---------------------------------------------------------------------
CREATE TABLE `resume` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `file_url` TEXT NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE: settings
-- ---------------------------------------------------------------------
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- SEED DATA INSERTION (INITIAL DATABASE VALUES)
-- =====================================================================

-- 1. SEED ADMIN USER (Default username: "Habtamu simeneh", password: "Habtish2121")
-- Password hashed using standard bcrypt-compatible algorithms.
INSERT INTO `users` (`id`, `username`, `password`, `name`, `email`, `bio`, `avatar_url`) VALUES
(1, 'Habtamu simeneh', '$2a$10$R9hkaXUPuwq0UgiToTym/e6bI9Gq6.uLg799XNfD25N/x8f2YfWLu', 'Habtamu Simeneh', 'habtesimeneh30@gmail.com', 'Information Systems student in Ethiopia specializing in full-stack engineering, secure database solutions, and high-performance system architectures.', '');

-- 2. SEED SYSTEM SETTINGS
INSERT INTO `settings` (`key`, `value`) VALUES
('site_name', 'Habtamu Simeneh'),
('site_title', 'Full Stack Engineer & System Architect'),
('site_subtitle', 'Specializing in high-performance web engineering, complex relational structures, and advanced algorithm logic. University student of Information Systems at Injibara University, Gojjam, Amhara, Ethiopia. Dedicated to deploying elegant, secure full-stack software.'),
('contact_email', 'habtesimeneh30@gmail.com'),
('contact_phone', '+251900000000'),
('contact_address', 'Gojjam, Injibara, Amhara Region, Ethiopia'),
('social_github', 'https://github.com/habtamu'),
('social_linkedin', 'https://linkedin.com/in/habtamu'),
('social_twitter', 'https://twitter.com/habtamu'),
('profile_image', ''),
('about_image', ''),
('resume_url', '/uploads/habtamu_resume.pdf');

-- 3. SEED MASTERED SKILLS
INSERT INTO `skills` (`name`, `category`, `percentage`) VALUES
('React.js', 'Frontend', 95),
('TypeScript', 'Frontend', 90),
('Tailwind CSS', 'Frontend', 95),
('Bootstrap 5', 'Frontend', 85),
('Node.js', 'Backend', 92),
('Express.js', 'Backend', 90),
('Python', 'Backend', 80),
('MySQL', 'Database', 95),
('PostgreSQL', 'Database', 88),
('SQLite', 'Database', 85),
('Git & GitHub', 'Tools', 90),
('Docker', 'Tools', 75),
('Figma', 'Tools', 82),
('XAMPP / Local Server', 'Tools', 95);

-- 4. SEED PROJECTS
INSERT INTO `projects` (`title`, `description`, `category`, `image_url`, `github_link`, `live_link`, `featured`) VALUES
('Ethio-E-Commerce Hub', 'A full-featured digital storefront tailored for Ethiopian businesses. Integrates with Chapa and Telebirr local payment gateways, featuring role-based authorization, inventory control, and transaction monitoring.', 'Full Stack', 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800', 'https://github.com/habtamu/ethio-ecom', 'https://ethio-ecom.demo.io', 1),
('Amharic NLP Sentiment Analyzer', 'An advanced machine learning pipeline designed to perform sentiment analysis on Amharic text. Solves challenges with morphological richness of Semitic languages and provides real-time polarity scores.', 'Backend & AI', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800', 'https://github.com/habtamu/amharic-nlp', 'https://amharic-nlp.demo.io', 1),
('Smart Agri-Tech IoT Dashboard', 'An interactive telemetry console designed for smallholder farms in Ethiopia. Displays real-time metrics for soil moisture, humidity, and temperature from sensor arrays, sending dynamic alerts to help optimize crop yields.', 'Full Stack', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800', 'https://github.com/habtamu/smart-agri', 'https://smart-agri.demo.io', 0),
('Digital Medical Registry', 'A secure, HIPAA-compliant patient management system created for local clinics. Simplifies electronic health records, manages patient queues, coordinates doctor schedules, and tracks historical diagnostics.', 'Database', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800', 'https://github.com/habtamu/med-registry', 'https://med-registry.demo.io', 0);

-- 5. SEED WORK EXPERIENCE
INSERT INTO `experience` (`company`, `role`, `start_date`, `end_date`, `description`) VALUES
('Innovate Ethiopia Tech Solutions', 'Full Stack Developer Intern', 'June 2025', 'Present', 'Co-developing scalable responsive web apps and managing relational database schemas in MySQL and PostgreSQL. Assisting in the deployment of payment gateway integrations.'),
('Freelance UI/UX Developer', 'Contract Designer & Web Coder', 'January 2024', 'June 2025', 'Engineered visually striking portfolios and single-page apps for local startups. Designed clean custom design systems and tailored black & gold luxury themed websites.');

-- 6. SEED EDUCATION RECORD
INSERT INTO `education` (`institution`, `degree`, `field_of_study`, `start_date`, `end_date`, `description`) VALUES
('Injibara University', 'Bachelor of Science', 'Information Systems', 'October 2023', 'July 2027 (Expected)', 'Specializing in Database Systems, Software Engineering, System Architecture, and Enterprise IT Strategy. Leading the university coding club and hacking marathons at Injibara University, Gojjam, Amhara Region.');

-- 7. SEED CORE SERVICES
INSERT INTO `services` (`title`, `description`, `icon`) VALUES
('Full-Stack Web Development', 'Crafting highly modular, production-ready full stack web applications with custom Express backends, modern React frameworks, and robust SQL databases.', 'Cpu'),
('Relational Database Design', 'Designing optimized relational database schemas (MySQL, PostgreSQL, SQLite) with structured indexing, relational constraints, and prepared transactional statements.', 'Database'),
('Research & Academic Writing', 'Authoring high-fidelity, peer-ready research papers and comprehensive technical documentation detailing complex software systems and methodologies.', 'FileText'),
('Creative Content & Video Production', 'Editing premium video content, tutorials, and interactive demonstrations to articulate product goals and simplify technical complex frameworks.', 'Video');

-- 8. SEED CLIENT TESTIMONIALS
INSERT INTO `testimonials` (`client_name`, `client_role`, `client_company`, `feedback`, `avatar_url`) VALUES
('Dawit Abebe', 'Lead Engineering Architect', 'EthioTech Solutions', 'Habtamu delivers stunning engineering depth. His full stack architecture design is exceptionally organized, and his implementation of database relational constraints was flawed.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'),
('Selamawit Giday', 'Managing Director', 'AgriGrow Ethiopia', 'The Smart Agri IoT dashboard Habtamu created has fundamentally improved how our researchers track microclimate data. Fast, responsive, and incredibly easy to manage via the admin page.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150');

-- 9. SEED ACADEMIC CERTIFICATES
INSERT INTO `certificates` (`title`, `issuer`, `issue_date`, `credential_url`, `image_url`) VALUES
('Database Management Systems Certification', 'Oracle Academy / Injibara University', '2024', 'https://academy.oracle.com', 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=300'),
('Full-Stack Software Engineering', 'ALX Africa', '2025', 'https://www.alxafrica.com', 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=300');

-- 10. SEED RESUME ATTACHMENT
INSERT INTO `resume` (`title`, `file_url`, `active`) VALUES
('Habtamu_Simeneh_Resume.pdf', '/uploads/habtamu_resume.pdf', 1);

-- 11. SEED BLOG ARTICLES
INSERT INTO `blogs` (`title`, `category`, `image_url`, `content`, `views`) VALUES
('Exploring Telebirr and Chapa Integrations in Express', 'Development', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800', '### Integrating Local Payment Gateways in Ethiopia\n\nModern payment systems in Ethiopia, such as **Telebirr** and **Chapa**, have revolutionized digital e-commerce. As developers, setting up seamless API handshakes is critical for robust customer experiences.\n\nIn this post, we discuss:\n1. **API Signature Validation**: How to verify digital signatures from Telebirr.\n2. **Payload Security**: Leveraging AES encryption on server-to-server request routes.\n3. **Webhook Reconciliation**: Implementing transaction listeners to automatically update database orders securely.\n\n```javascript\n// Example validation snippet using crypto\nconst crypto = require(\'crypto\');\nfunction decryptPayload(encryptedData, key) {\n  const decipher = crypto.createDecipheriv(\'aes-128-cbc\', key, iv);\n  let decrypted = decipher.update(encryptedData, \'hex\', \'utf8\');\n  decrypted += decipher.final(\'utf8\');\n  return JSON.parse(decrypted);\n}\n```\n\nBy ensuring end-to-end security, full-stack applications in East Africa can gain unmatched developer confidence.', 345),
('Mastering Database Schemas: From Normalization to Optimization', 'Databases', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800', '### Relational Database Engineering\n\nEvery complex web system lives or dies by its database. When building an enterprise portfolio CMS or e-commerce portal, structuring relational tables requires precision.\n\n#### 1. Database Normalization (1NF to 3NF)\nStructuring databases to prevent data redundancy:\n* **First Normal Form**: Eliminate duplicate columns and ensure atomic values.\n* **Second Normal Form**: Remove partial dependencies.\n* **Third Normal Form**: Remove transitive dependencies.\n\n#### 2. Query Optimization\nLeverage indexing on foreign keys and commonly searched fields:\n```sql\nCREATE INDEX idx_project_category ON projects(category);\n```\n\nAlways use **prepared statements** to shield against dangerous SQL Injection attacks!', 289);
