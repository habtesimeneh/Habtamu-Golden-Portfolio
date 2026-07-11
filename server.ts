import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "habtamu_gold_portfolio_secret_2026";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Security Headers & CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SAMEORIGIN");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Setup upload directories
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, gif) and documents (pdf, doc, docx) are allowed"));
    }
  },

});

// ==========================================
// DUAL DATABASE CONTEXT MANAGER (SQLITE + MYSQL)
// ==========================================
const DB_TYPE = process.env.DB_TYPE || "sqlite";
console.log("process.env.DB_TYPE =", process.env.DB_TYPE);
console.log("DB_TYPE =", DB_TYPE);
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "habtamu_gold_portfolio";

let sqliteDb: any = null;
let mysqlPool: any = null;

async function initDb() {
  if (DB_TYPE === "mysql") {
    console.log(`[Database] Connecting to MySQL server at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
    try {
      // 👇 CA Certificate ፋይሉን አንብብ
      let caCert: Buffer | undefined;
      try {
        caCert = fs.readFileSync(path.join(process.cwd(), 'ca.pem'));
        console.log("[Database] CA Certificate loaded successfully.");
      } catch (err) {
        console.warn("[Database] CA Certificate not found, using SSL without verification.");
        // ፋይሉ ከሌለ rejectUnauthorized: false ተጠቀም
      }

      const adminConnection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        ssl: caCert ? {
          ca: caCert,
          rejectUnauthorized: true
        } : {
          rejectUnauthorized: false
        }
      });
      await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await adminConnection.end();

      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        ssl: caCert ? {
          ca: caCert,
          rejectUnauthorized: true
        } : {
          rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true,
      });
      console.log(`[Database] MySQL Connected successfully! Database Name: ${DB_NAME}`);
    } catch (err: any) {
      console.error("[Database] Failed to connect to MySQL database! Falling back to SQLite.", err.message);
      setupSqliteFallback();
    }
  } else {
    setupSqliteFallback();
  }
}
function setupSqliteFallback() {
  console.log("[Database] Initializing SQLite database...");
  const dbPath = path.join(process.cwd(), "database.db");
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma("foreign_keys = ON");
}

// Translate SQLite syntax to MySQL syntax
function translateSql(sql: string): string {
  if (DB_TYPE === "mysql" && mysqlPool) {
    return sql
      .replace(/ON CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET\s+value\s*=\s*excluded\.value/gi, "ON DUPLICATE KEY UPDATE value = VALUES(value)")
      .replace(/ON CONFLICT/gi, "ON DUPLICATE KEY");
  }
  return sql;
}

// Unified Query Executers
async function dbQuery(sql: string, params: any[] = []): Promise<any[]> {
  const translated = translateSql(sql);
  if (DB_TYPE === "mysql" && mysqlPool) {
    const [rows] = await mysqlPool.execute(translated, params);
    return rows as any[];
  } else {
    return sqliteDb.prepare(translated).all(...params);
  }
}

async function dbGet(sql: string, params: any[] = []): Promise<any> {
  const translated = translateSql(sql);
  if (DB_TYPE === "mysql" && mysqlPool) {
    const [rows] = await mysqlPool.execute(translated, params);
    const results = rows as any[];
    return results[0] || null;
  } else {
    return sqliteDb.prepare(translated).get(...params);
  }
}

async function dbRun(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number | bigint }> {
  const translated = translateSql(sql);
  if (DB_TYPE === "mysql" && mysqlPool) {
    const [result] = await mysqlPool.execute(translated, params);
    return { lastInsertRowid: (result as any).insertId || 0 };
  } else {
    const res = sqliteDb.prepare(translated).run(...params);
    return { lastInsertRowid: res.lastInsertRowid };
  }
}

async function dbExec(sql: string): Promise<void> {
  if (DB_TYPE === "mysql" && mysqlPool) {
    // Process statements into valid MySQL dialect
    let mysqlSql = sql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, "INT AUTO_INCREMENT PRIMARY KEY")
      .replace(/CHECK\s*\([^)]*\)/g, ""); // strip check constraints

    mysqlSql = mysqlSql.replace(
      /key TEXT UNIQUE/g,
      "`key` VARCHAR(255) UNIQUE"
    );

    mysqlSql = mysqlSql.replace(
      /value TEXT/g,
      "`value` LONGTEXT"
    );

    mysqlSql = mysqlSql.replace(
      /username TEXT UNIQUE/g,
      "username VARCHAR(255) UNIQUE"
    );
    await mysqlPool.query(mysqlSql);
  } else {
    sqliteDb.exec(sql);
  }
}

// ==========================================
// SCHEMA GENERATION & DATA SEEDING
// ==========================================
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    github_link TEXT,
    live_link TEXT,
    featured INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    percentage INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_role TEXT NOT NULL,
    client_company TEXT,
    feedback TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    credential_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resume (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orbit_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function seedDatabase() {
  // 1. Seed Admin User
  const userCount = await dbGet("SELECT COUNT(*) as count FROM users");
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync("Habtish2121", 10);
    await dbRun(
      `INSERT INTO users (username, password, name, email, bio, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Habtamu simeneh",
        hashedPassword,
        "Habtamu Simeneh",
        "habtesimeneh30@gmail.com",
        "Information Systems student in Ethiopia specializing in full-stack engineering, secure database solutions, and high-performance system architectures.",
        ""
      ]
    );
    console.log("[Database] Admin user seeded!");
  }

  // 2. Seed Skills
  const skillsCount = await dbGet("SELECT COUNT(*) as count FROM skills");
  if (skillsCount.count === 0) {
    const defaultSkills = [
      { name: "React.js", category: "Frontend", percentage: 95 },
      { name: "TypeScript", category: "Frontend", percentage: 90 },
      { name: "Tailwind CSS", category: "Frontend", percentage: 95 },
      { name: "Bootstrap 5", category: "Frontend", percentage: 85 },
      { name: "Node.js", category: "Backend", percentage: 92 },
      { name: "Express.js", category: "Backend", percentage: 90 },
      { name: "Python", category: "Backend", percentage: 80 },
      { name: "MySQL", category: "Database", percentage: 95 },
      { name: "PostgreSQL", category: "Database", percentage: 88 },
      { name: "SQLite", category: "Database", percentage: 85 },
      { name: "Git & GitHub", category: "Tools", percentage: 90 },
      { name: "Docker", category: "Tools", percentage: 75 },
      { name: "Figma", category: "Tools", percentage: 82 },
      { name: "XAMPP / Local Server", category: "Tools", percentage: 95 }
    ];
    for (const s of defaultSkills) {
      await dbRun("INSERT INTO skills (name, category, percentage) VALUES (?, ?, ?)", [s.name, s.category, s.percentage]);
    }
    console.log("[Database] Skills seeded!");
  }

  // 3. Seed Projects
  const projectsCount = await dbGet("SELECT COUNT(*) as count FROM projects");
  if (projectsCount.count === 0) {
    const defaultProjects = [
      {
        title: "Ethio-E-Commerce Hub",
        description: "A full-featured digital storefront tailored for Ethiopian businesses. Integrates with Chapa and Telebirr local payment gateways, featuring role-based authorization, inventory control, and transaction monitoring.",
        category: "Full Stack",
        image_url: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800",
        github_link: "https://github.com/habtamu/ethio-ecom",
        live_link: "https://ethio-ecom.demo.io",
        featured: 1
      },
      {
        title: "Amharic NLP Sentiment Analyzer",
        description: "An advanced machine learning pipeline designed to perform sentiment analysis on Amharic text. Solves challenges with morphological richness of Semitic languages and provides real-time polarity scores.",
        category: "Backend & AI",
        image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
        github_link: "https://github.com/habtamu/amharic-nlp",
        live_link: "https://amharic-nlp.demo.io",
        featured: 1
      },
      {
        title: "Smart Agri-Tech IoT Dashboard",
        description: "An interactive telemetry console designed for smallholder farms in Ethiopia. Displays real-time metrics for soil moisture, humidity, and temperature from sensor arrays, sending dynamic alerts to help optimize crop yields.",
        category: "Full Stack",
        image_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800",
        github_link: "https://github.com/habtamu/smart-agri",
        live_link: "https://smart-agri.demo.io",
        featured: 0
      },
      {
        title: "Digital Medical Registry",
        description: "A secure, HIPAA-compliant patient management system created for local clinics. Simplifies electronic health records, manages patient queues, coordinates doctor schedules, and tracks historical diagnostics.",
        category: "Database",
        image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800",
        github_link: "https://github.com/habtamu/med-registry",
        live_link: "https://med-registry.demo.io",
        featured: 0
      }
    ];
    for (const proj of defaultProjects) {
      await dbRun(
        `INSERT INTO projects (title, description, category, image_url, github_link, live_link, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [proj.title, proj.description, proj.category, proj.image_url, proj.github_link, proj.live_link, proj.featured]
      );
    }
    console.log("[Database] Projects seeded!");
  }

  // 4. Seed Experience
  const expCount = await dbGet("SELECT COUNT(*) as count FROM experience");
  if (expCount.count === 0) {
    const defaultExps = [
      {
        company: "Innovate Ethiopia Tech Solutions",
        role: "Full Stack Developer Intern",
        start_date: "June 2025",
        end_date: "Present",
        description: "Co-developing scalable responsive web apps and managing relational database schemas in MySQL and PostgreSQL. Assisting in the deployment of payment gateway integrations."
      },
      {
        company: "Freelance UI/UX Developer",
        role: "Contract Designer & Web Coder",
        start_date: "January 2024",
        end_date: "June 2025",
        description: "Engineered visually striking portfolios and single-page apps for local startups. Designed clean custom design systems and tailored black & gold luxury themed websites."
      }
    ];
    for (const exp of defaultExps) {
      await dbRun(
        `INSERT INTO experience (company, role, start_date, end_date, description)
         VALUES (?, ?, ?, ?, ?)`,
        [exp.company, exp.role, exp.start_date, exp.end_date, exp.description]
      );
    }
  }

  // 5. Seed Education
  const eduCount = await dbGet("SELECT COUNT(*) as count FROM education");
  if (eduCount.count === 0) {
    const defaultEdus = [
      {
        institution: "Injibara University",
        degree: "Bachelor of Science",
        field_of_study: "Information Systems",
        start_date: "October 2023",
        end_date: "July 2027 (Expected)",
        description: "Specializing in Database Systems, Software Engineering, System Architecture, and Enterprise IT Strategy. Leading the university coding club and hacking marathons at Injibara University, Gojjam, Amhara Region."
      }
    ];
    for (const edu of defaultEdus) {
      await dbRun(
        `INSERT INTO education (institution, degree, field_of_study, start_date, end_date, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [edu.institution, edu.degree, edu.field_of_study, edu.start_date, edu.end_date, edu.description]
      );
    }
  }

  // 6. Seed Services
  const servicesCount = await dbGet("SELECT COUNT(*) as count FROM services");
  if (servicesCount.count === 0) {
    const defaultServices = [
      {
        title: "Full-Stack Web Development",
        description: "Crafting highly modular, production-ready full stack web applications with custom Express backends, modern React frameworks, and robust SQL databases.",
        icon: "Cpu"
      },
      {
        title: "Relational Database Design",
        description: "Designing optimized relational database schemas (MySQL, PostgreSQL, SQLite) with structured indexing, relational constraints, and prepared transactional statements.",
        icon: "Database"
      },
      {
        title: "Research & Academic Writing",
        description: "Authoring high-fidelity, peer-ready research papers and comprehensive technical documentation detailing complex software systems and methodologies.",
        icon: "FileText"
      },
      {
        title: "Creative Content & Video Production",
        description: "Editing premium video content, tutorials, and interactive demonstrations to articulate product goals and simplify technical complex frameworks.",
        icon: "Video"
      }
    ];
    for (const s of defaultServices) {
      await dbRun("INSERT INTO services (title, description, icon) VALUES (?, ?, ?)", [s.title, s.description, s.icon]);
    }
    console.log("[Database] Services seeded!");
  }

  // 7. Seed Testimonials
  const tCount = await dbGet("SELECT COUNT(*) as count FROM testimonials");
  if (tCount.count === 0) {
    const defaultTestimonials = [
      {
        client_name: "Dawit Abebe",
        client_role: "Lead Engineering Architect",
        client_company: "EthioTech Solutions",
        feedback: "Habtamu delivers stunning engineering depth. His full stack architecture design is exceptionally organized, and his implementation of database relational constraints was flawless.",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
      },
      {
        client_name: "Selamawit Giday",
        client_role: "Managing Director",
        client_company: "AgriGrow Ethiopia",
        feedback: "The Smart Agri IoT dashboard Habtamu created has fundamentally improved how our researchers track microclimate data. Fast, responsive, and incredibly easy to manage via the admin page.",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
      }
    ];
    for (const t of defaultTestimonials) {
      await dbRun(
        `INSERT INTO testimonials (client_name, client_role, client_company, feedback, avatar_url)
         VALUES (?, ?, ?, ?, ?)`,
        [t.client_name, t.client_role, t.client_company, t.feedback, t.avatar_url]
      );
    }
  }

  // 8. Seed Blogs
  const blogsCount = await dbGet("SELECT COUNT(*) as count FROM blogs");
  if (blogsCount.count === 0) {
    const defaultBlogs = [
      {
        title: "Exploring Telebirr and Chapa Integrations in Express",
        category: "Development",
        image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800",
        content: `### Integrating Local Payment Gateways in Ethiopia

Modern payment systems in Ethiopia, such as **Telebirr** and **Chapa**, have revolutionized digital e-commerce. As developers, setting up seamless API handshakes is critical for robust customer experiences.

In this post, we discuss:
1. **API Signature Validation**: How to verify digital signatures from Telebirr.
2. **Payload Security**: Leveraging AES encryption on server-to-server request routes.
3. **Webhook Reconciliation**: Implementing transaction listeners to automatically update database orders securely.

\`\`\`javascript
// Example validation snippet using crypto
const crypto = require('crypto');
function decryptPayload(encryptedData, key) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}
\`\`\`

By ensuring end-to-end security, full-stack applications in East Africa can gain unmatched developer confidence.`,
        views: 345
      },
      {
        title: "Mastering Database Schemas: From Normalization to Optimization",
        category: "Databases",
        image_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800",
        content: `### Relational Database Engineering

Every complex web system lives or dies by its database. When building an enterprise portfolio CMS or e-commerce portal, structuring relational tables requires precision.

#### 1. Database Normalization (1NF to 3NF)
Structuring databases to prevent data redundancy:
* **First Normal Form**: Eliminate duplicate columns and ensure atomic values.
* **Second Normal Form**: Remove partial dependencies.
* **Third Normal Form**: Remove transitive dependencies.

#### 2. Query Optimization
Leverage indexing on foreign keys and commonly searched fields:
\`\`\`sql
CREATE INDEX idx_project_category ON projects(category);
\`\`\`

Always use **prepared statements** to shield against dangerous SQL Injection attacks!`,
        views: 289
      }
    ];
    for (const b of defaultBlogs) {
      await dbRun(
        `INSERT INTO blogs (title, category, image_url, content, views)
         VALUES (?, ?, ?, ?, ?)`,
        [b.title, b.category, b.image_url, b.content, b.views]
      );
    }
  }

  // 9. Seed Settings
  const settingsCount = await dbGet("SELECT COUNT(*) as count FROM settings");
  if (settingsCount.count === 0) {
    const defaultSettings = [
      { key: "site_name", value: "Habtamu Simeneh" },
      { key: "site_title", value: "Full Stack Engineer & System Architect" },
      { key: "site_subtitle", value: "Specializing in high-performance web engineering, complex relational structures, and advanced algorithm logic. University student of Information Systems at Injibara University, Gojjam, Amhara, Ethiopia. Dedicated to deploying elegant, secure full-stack software." },
      { key: "contact_email", value: "habtesimeneh30@gmail.com" },
      { key: "contact_phone", value: "+251900000000" },
      { key: "contact_address", value: "Gojjam, Injibara, Amhara Region, Ethiopia" },
      { key: "social_github", value: "https://github.com/habtamu" },
      { key: "social_linkedin", value: "https://linkedin.com/in/habtamu" },
      { key: "social_twitter", value: "https://twitter.com/habtamu" },
      { key: "profile_image", value: "" },
      { key: "resume_url", value: "/uploads/habtamu_resume.pdf" }
    ];
   for (const s of defaultSettings) {
  await dbRun(
    "INSERT INTO settings (`key`, `value`) VALUES (?, ?)",
    [s.key, s.value]
  );
  }
  }

  // 10. Seed Resume
  const resumeCount = await dbGet("SELECT COUNT(*) as count FROM resume");
  if (resumeCount.count === 0) {
    await dbRun("INSERT INTO resume (title, file_url, active) VALUES (?, ?, ?)", ["Habtamu_Simeneh_Resume.pdf", "/uploads/habtamu_resume.pdf", 1]);
  }

  // 11. Seed Certificates
  const certCount = await dbGet("SELECT COUNT(*) as count FROM certificates");
  if (certCount.count === 0) {
    const defaultCerts = [
      {
        title: "Database Management Systems Certification",
        issuer: "Oracle Academy / Injibara University",
        issue_date: "2024",
        credential_url: "https://academy.oracle.com",
        image_url: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=300"
      },
      {
        title: "Full-Stack Software Engineering",
        issuer: "ALX Africa",
        issue_date: "2025",
        credential_url: "https://www.alxafrica.com",
        image_url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=300"
      }
    ];
    for (const c of defaultCerts) {
      await dbRun(
        `INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [c.title, c.issuer, c.issue_date, c.credential_url, c.image_url]
      );
    }
  }

  // 12. Seed Orbit Texts
  const orbitCount = await dbGet("SELECT COUNT(*) as count FROM orbit_texts");
  if (orbitCount.count === 0) {
    const defaultOrbitTexts = [
      "Full-Stack Software Engineer",
      "Database System Architect",
      "Information Systems Specialist",
      "Academic Research Writer"
    ];
    for (const text of defaultOrbitTexts) {
      await dbRun("INSERT INTO orbit_texts (text) VALUES (?)", [text]);
    }
    console.log("[Database] Orbit texts seeded!");
  }
}

async function runMigrations() {
  try {
    // Clean up old unsplash values
    await dbRun("UPDATE settings SET value = '' WHERE `key` = 'profile_image' AND value LIKE '%unsplash.com%'");
    await dbRun("UPDATE users SET avatar_url = '' WHERE username = 'Habtamu simeneh' AND avatar_url LIKE '%unsplash.com%'");

    // Enforce default password
    const hashedPassword = bcrypt.hashSync("Habtish2121", 10);
    await dbRun("UPDATE users SET password = ? WHERE username = ?", [hashedPassword, "Habtamu simeneh"]);

    // Fix certificate links
    await dbRun("UPDATE certificates SET credential_url = 'https://academy.oracle.com' WHERE credential_url = 'https://oracle.com/verify/1234' OR credential_url IS NULL OR credential_url = ''");
    await dbRun("UPDATE certificates SET credential_url = 'https://www.alxafrica.com' WHERE credential_url = 'https://alx.com/verify/5678'");
    console.log("[Database] Migrations run successfully!");
  } catch (err: any) {
    console.error("[Database] Migration warning:", err.message);
  }
}

// 🔐 AUTHENTICATION MIDDLEWARE
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// API ROUTES
// ==========================================

// AUTH API
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  try {
    const user = await dbGet("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await dbGet("SELECT id, username, name, email, bio, avatar_url FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const aboutImageSetting = await dbGet("SELECT value FROM settings WHERE `key` = 'about_image'");
    user.about_image = aboutImageSetting ? aboutImageSetting.value : "";
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
  const { name, email, bio, avatar_url, about_image, password } = req.body;
  try {
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      await dbRun(
        `UPDATE users
         SET name = ?, email = ?, bio = ?, avatar_url = ?, password = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, email, bio, avatar_url, hashedPassword, req.user.id]
      );
    } else {
      await dbRun(
        `UPDATE users
         SET name = ?, email = ?, bio = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, email, bio, avatar_url, req.user.id]
      );
    }

    if (avatar_url !== undefined) {
  await dbRun(
    "INSERT INTO settings (`key`, `value`) VALUES ('profile_image', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [avatar_url]
  );
}

if (about_image !== undefined) {
  await dbRun(
    "INSERT INTO settings (`key`, `value`) VALUES ('about_image', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [about_image]
  );
}

if (name) {
  await dbRun(
    "INSERT INTO settings (`key`, `value`) VALUES ('site_name', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [name]
  );
}

if (bio) {
  await dbRun(
    "INSERT INTO settings (`key`, `value`) VALUES ('site_subtitle', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [bio]
  );
}

    res.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PROJECTS CRUD
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await dbQuery("SELECT * FROM projects ORDER BY featured DESC, id DESC");
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects", authenticateToken, async (req, res) => {
  const { title, description, category, image_url, github_link, live_link, featured } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ error: "Title, description, and category are required" });
  }
  try {
    const result = await dbRun(
      `INSERT INTO projects (title, description, category, image_url, github_link, live_link, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, image_url || "", github_link || "", live_link || "", featured ? 1 : 0]
    );
    res.status(201).json({ id: result.lastInsertRowid, title, description, category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:id", authenticateToken, async (req, res) => {
  const { title, description, category, image_url, github_link, live_link, featured } = req.body;
  try {
    await dbRun(
      `UPDATE projects
       SET title = ?, description = ?, category = ?, image_url = ?, github_link = ?, live_link = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, category, image_url, github_link, live_link, featured ? 1 : 0, req.params.id]
    );
    res.json({ message: "Project updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM projects WHERE id = ?", [req.params.id]);
    res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SKILLS CRUD
app.get("/api/skills", async (req, res) => {
  try {
    const skills = await dbQuery("SELECT * FROM skills ORDER BY percentage DESC");
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/skills", authenticateToken, async (req, res) => {
  const { name, category, percentage } = req.body;
  if (!name || !category || percentage === undefined) {
    return res.status(400).json({ error: "Name, category, and percentage are required" });
  }
  try {
    const result = await dbRun(
      "INSERT INTO skills (name, category, percentage) VALUES (?, ?, ?)",
      [name, category, Number(percentage)]
    );
    res.status(201).json({ id: result.lastInsertRowid, name, category, percentage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/skills/:id", authenticateToken, async (req, res) => {
  const { name, category, percentage } = req.body;
  try {
    await dbRun(
      `UPDATE skills
       SET name = ?, category = ?, percentage = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, category, Number(percentage), req.params.id]
    );
    res.json({ message: "Skill updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/skills/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM skills WHERE id = ?", [req.params.id]);
    res.json({ message: "Skill deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// EDUCATION CRUD
app.get("/api/education", async (req, res) => {
  try {
    const education = await dbQuery("SELECT * FROM education ORDER BY start_date DESC");
    res.json(education);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/education", authenticateToken, async (req, res) => {
  const { institution, degree, field_of_study, start_date, end_date, description } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO education (institution, degree, field_of_study, start_date, end_date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [institution, degree, field_of_study, start_date, end_date, description]
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/education/:id", authenticateToken, async (req, res) => {
  const { institution, degree, field_of_study, start_date, end_date, description } = req.body;
  try {
    await dbRun(
      `UPDATE education
       SET institution = ?, degree = ?, field_of_study = ?, start_date = ?, end_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [institution, degree, field_of_study, start_date, end_date, description, req.params.id]
    );
    res.json({ message: "Education updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/education/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM education WHERE id = ?", [req.params.id]);
    res.json({ message: "Education deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// EXPERIENCE CRUD
app.get("/api/experience", async (req, res) => {
  try {
    const experience = await dbQuery("SELECT * FROM experience ORDER BY start_date DESC");
    res.json(experience);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/experience", authenticateToken, async (req, res) => {
  const { company, role, start_date, end_date, description } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO experience (company, role, start_date, end_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [company, role, start_date, end_date, description]
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/experience/:id", authenticateToken, async (req, res) => {
  const { company, role, start_date, end_date, description } = req.body;
  try {
    await dbRun(
      `UPDATE experience
       SET company = ?, role = ?, start_date = ?, end_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [company, role, start_date, end_date, description, req.params.id]
    );
    res.json({ message: "Experience updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/experience/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM experience WHERE id = ?", [req.params.id]);
    res.json({ message: "Experience deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SERVICES CRUD
app.get("/api/services", async (req, res) => {
  try {
    const services = await dbQuery("SELECT * FROM services ORDER BY id ASC");
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/services", authenticateToken, async (req, res) => {
  const { title, description, icon } = req.body;
  try {
    const result = await dbRun("INSERT INTO services (title, description, icon) VALUES (?, ?, ?)", [title, description, icon]);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/services/:id", authenticateToken, async (req, res) => {
  const { title, description, icon } = req.body;
  try {
    await dbRun(
      `UPDATE services
       SET title = ?, description = ?, icon = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, icon, req.params.id]
    );
    res.json({ message: "Service updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/services/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM services WHERE id = ?", [req.params.id]);
    res.json({ message: "Service deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TESTIMONIALS CRUD
app.get("/api/testimonials", async (req, res) => {
  try {
    const testimonials = await dbQuery("SELECT * FROM testimonials ORDER BY id DESC");
    res.json(testimonials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/testimonials", authenticateToken, async (req, res) => {
  const { client_name, client_role, client_company, feedback, avatar_url } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO testimonials (client_name, client_role, client_company, feedback, avatar_url)
       VALUES (?, ?, ?, ?, ?)`,
      [client_name, client_role, client_company, feedback, avatar_url]
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/testimonials/:id", authenticateToken, async (req, res) => {
  const { client_name, client_role, client_company, feedback, avatar_url } = req.body;
  try {
    await dbRun(
      `UPDATE testimonials
       SET client_name = ?, client_role = ?, client_company = ?, feedback = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [client_name, client_role, client_company, feedback, avatar_url, req.params.id]
    );
    res.json({ message: "Testimonial updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/testimonials/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// BLOGS CRUD
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await dbQuery("SELECT * FROM blogs ORDER BY id DESC");
    res.json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  try {
    // Increment view counter on read
    await dbRun("UPDATE blogs SET views = views + 1 WHERE id = ?", [req.params.id]);
    const blog = await dbGet("SELECT * FROM blogs WHERE id = ?", [req.params.id]);
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/blogs", authenticateToken, async (req, res) => {
  const { title, content, category, image_url } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Title, content, and category are required" });
  }
  try {
    const result = await dbRun(
      `INSERT INTO blogs (title, content, category, image_url, views)
       VALUES (?, ?, ?, ?, 0)`,
      [title, content, category, image_url]
    );
    res.status(201).json({ id: result.lastInsertRowid, title, category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/blogs/:id", authenticateToken, async (req, res) => {
  const { title, content, category, image_url } = req.body;
  try {
    await dbRun(
      `UPDATE blogs
       SET title = ?, content = ?, category = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content, category, image_url, req.params.id]
    );
    res.json({ message: "Blog updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/blogs/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    res.json({ message: "Blog deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MESSAGES (CONTACT FORM) API
app.get("/api/messages", authenticateToken, async (req, res) => {
  try {
    const messages = await dbQuery("SELECT * FROM messages ORDER BY id DESC");
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  const { sender_name, sender_email, subject, message } = req.body;
  if (!sender_name || !sender_email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sender_email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  try {
    await dbRun(
      `INSERT INTO messages (sender_name, sender_email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [sender_name, sender_email, subject || "No Subject", message]
    );
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/messages/:id/read", authenticateToken, async (req, res) => {
  try {
    await dbRun("UPDATE messages SET is_read = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ message: "Message marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/messages/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM messages WHERE id = ?", [req.params.id]);
    res.json({ message: "Message deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SETTINGS API
app.get("/api/settings", async (req, res) => {
  try {
    const rawSettings = await dbQuery("SELECT * FROM settings");
    const settingsMap: Record<string, string> = {};
    rawSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/settings", authenticateToken, async (req, res) => {
  const settings = req.body;
  try {
   for (const [key, val] of Object.entries(settings)) {
  await dbRun(
    "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [key, String(val)]
  );
}
    res.json({ message: "Settings updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CERTIFICATES CRUD
app.get("/api/certificates", async (req, res) => {
  try {
    const certs = await dbQuery("SELECT * FROM certificates ORDER BY issue_date DESC");
    res.json(certs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/certificates", authenticateToken, async (req, res) => {
  const { title, issuer, issue_date, credential_url, image_url } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [title, issuer, issue_date, credential_url, image_url]
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/certificates/:id", authenticateToken, async (req, res) => {
  const { title, issuer, issue_date, credential_url, image_url } = req.body;
  try {
    await dbRun(
      `UPDATE certificates
       SET title = ?, issuer = ?, issue_date = ?, credential_url = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, issuer, issue_date, credential_url, image_url, req.params.id]
    );
    res.json({ message: "Certificate updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/certificates/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM certificates WHERE id = ?", [req.params.id]);
    res.json({ message: "Certificate deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GALLERY CRUD
app.get("/api/gallery", async (req, res) => {
  try {
    const items = await dbQuery("SELECT * FROM gallery ORDER BY id DESC");
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gallery", authenticateToken, async (req, res) => {
  const { title, image_url, category } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO gallery (title, image_url, category)
       VALUES (?, ?, ?)`,
      [title, image_url, category]
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/gallery/:id", authenticateToken, async (req, res) => {
  const { title, image_url, category } = req.body;
  try {
    await dbRun(
      `UPDATE gallery
       SET title = ?, image_url = ?, category = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, image_url, category, req.params.id]
    );
    res.json({ message: "Gallery item updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/gallery/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM gallery WHERE id = ?", [req.params.id]);
    res.json({ message: "Gallery item deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ORBIT TEXTS CRUD
app.get("/api/orbit-texts", async (req, res) => {
  try {
    const items = await dbQuery("SELECT * FROM orbit_texts ORDER BY id ASC");
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orbit-texts", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    const result = await dbRun("INSERT INTO orbit_texts (text) VALUES (?)", [text]);
    res.status(201).json({ id: result.lastInsertRowid, text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/orbit-texts/:id", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    await dbRun("UPDATE orbit_texts SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [text, req.params.id]);
    res.json({ message: "Orbit text updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/orbit-texts/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM orbit_texts WHERE id = ?", [req.params.id]);
    res.json({ message: "Orbit text deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// RESUME CRUD
app.get("/api/resume", async (req, res) => {
  try {
    const items = await dbQuery("SELECT * FROM resume ORDER BY active DESC, id DESC");
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/resume", authenticateToken, async (req, res) => {
  const { title, file_url, active } = req.body;
  try {
    if (active) {
      await dbRun("UPDATE resume SET active = 0");
    }
    const result = await dbRun(
      `INSERT INTO resume (title, file_url, active)
       VALUES (?, ?, ?)`,
      [title, file_url, active ? 1 : 0]
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/resume/:id", authenticateToken, async (req, res) => {
  const { title, file_url, active } = req.body;
  try {
    if (active) {
      await dbRun("UPDATE resume SET active = 0");
    }
    await dbRun(
      `UPDATE resume
       SET title = ?, file_url = ?, active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, file_url, active ? 1 : 0, req.params.id]
    );
    res.json({ message: "Resume updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/resume/:id", authenticateToken, async (req, res) => {
  try {
    await dbRun("DELETE FROM resume WHERE id = ?", [req.params.id]);
    res.json({ message: "Resume deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cloudinary አዘጋጅ
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage አዘጋጅ
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'habtamu_portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }
    ]
  } as any,
});

const cloudinaryUpload = multer({
  storage: cloudStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
  },
});

// FILE UPLOAD ENDPOINT
app.post("/api/upload", authenticateToken, cloudinaryUpload.single("file"), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded or file type is invalid" });
  }
  
  const fileUrl = req.file.path || (req.file as any).url;
  
  res.json({
    message: "File uploaded successfully!",
    fileUrl: fileUrl,
    filename: req.file.filename || (req.file as any).public_id,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// STATS ENDPOINT FOR DASHBOARD OVERVIEW
app.get("/api/stats", authenticateToken, async (req, res) => {
  try {
    const projects = await dbGet("SELECT COUNT(*) as count FROM projects");
    const skills = await dbGet("SELECT COUNT(*) as count FROM skills");
    const blogs = await dbGet("SELECT COUNT(*) as count FROM blogs");
    const messages = await dbGet("SELECT COUNT(*) as count FROM messages");
    const unreadMessages = await dbGet("SELECT COUNT(*) as count FROM messages WHERE is_read = 0");
    const testimonials = await dbGet("SELECT COUNT(*) as count FROM testimonials");
    const blogsViews = await dbGet("SELECT SUM(views) as total_views FROM blogs");

    res.json({
      projects: projects.count,
      skills: skills.count,
      blogs: blogs.count,
      messages: messages.count,
      unreadMessages: unreadMessages.count,
      testimonials: testimonials.count,
      blogViews: blogsViews.total_views || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// VITE MIDDLEWARE SETUP & STARTUP SEQUENCE
async function startServer() {
  // 1. Initialize DB Driver (SQLite or MySQL)
  await initDb();

  // 2. Provision Schema Tables (SQLite or MySQL)
  try {
    await dbExec(SCHEMA_SQL);
    console.log("[Database] Schema check completed successfully.");
  } catch (err: any) {
    console.error("[Database] Error creating schema tables:", err.message);
  }

  // 3. Seed Default Records
  try {
    await seedDatabase();
  } catch (err: any) {
    console.error("[Database] Error seeding database:", err.message);
  }

  // 4. Run Migrations & Corrections
  try {
    await runMigrations();
  } catch (err: any) {
    console.error("[Database] Error running database migrations:", err.message);
  }

  // 5. Mount Vite middleware for SPA
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 HABTAMU PORTFOLIO CMS DEV SERVER`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Active Database Dialect: ${DB_TYPE.toUpperCase()}`);
    console.log(`======================================================\n`);
  }).on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is busy. Trying ${PORT + 1}...`);
      app.listen(PORT + 1, "0.0.0.0", () => {
        console.log(`\n======================================================`);
        console.log(`🚀 HABTAMU PORTFOLIO CMS DEV SERVER`);
        console.log(`   Running on http://localhost:${PORT + 1}`);
        console.log(`   Active Database Dialect: ${DB_TYPE.toUpperCase()}`);
        console.log(`======================================================\n`);
      });
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

startServer();

