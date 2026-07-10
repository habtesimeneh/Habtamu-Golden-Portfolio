# 🌟 Habtamu Simeneh - Premium Gold Portfolio CMS (Full-Stack)

Welcome to the official, production-ready source code repository for **Habtamu Simeneh's Full-Stack Portfolio & CMS System**. This application is engineered with an elegant black and gold luxury aesthetic, featuring real-time data visualization, dynamic progress bars, a customized CMS admin dashboard, and dual-database architecture.

---

## 📂 Project Organization (Frontend & Backend Structure)

For clean separation of concerns, the repository is organized into distinct logical zones representing the **Frontend Client** and **Backend Server**:

### 🎨 Frontend Layer (`/src`)
The client application is built using modern **React 19**, **Vite**, **Tailwind CSS**, and **Motion** (Framer Motion) for highly polished, responsive, and performance-oriented views:
- `/src/main.tsx` & `/src/App.tsx`: Main React entry and secure client-side router.
- `/src/views/`: Dynamic view pages:
  - `Home.tsx`: Premium landing with rotating gold frame, bio text, and interactive elements.
  - `About.tsx`: Detailed education history, professional milestones, and experience timelines.
  - `Skills.tsx`: Technical skill bars with real-time on-scroll scroll animations.
  - `Projects.tsx`: Relational portfolio listing with live categories and detail modals.
  - `Services.tsx`: Academic writing, content production, database design, and software engineering services.
  - `Blog.tsx`: Educational full-length articles and interactive search.
  - `Login.tsx`: Encrypted, gateway-restricted admin entrance.
- `/src/components/`: Modular reusable components (Navbar, Footer, Admin Dashboard, Toast).

### ⚙️ Backend Layer (`server.ts` & Schemas)
The backend services are powered by **Node.js** and **Express.js**, serving APIs and securely communicating with the database:
- `server.ts`: Complete Express server containing database drivers, JWT authentication middleware, file uploads via Multer, and CRUD controllers.
- `schema.sql`: Fully documented relational SQL schema with constraints, indexes, and high-fidelity seed data ready to import into local MAMP, phpMyAdmin, or remote MySQL servers.
- `database_schema.sql`: Reference schema file.

---

## 🗄️ Hybrid Database Architecture (SQLite & MySQL)

To solve the ephemeral disk limitation of serverless cloud deployments (where projects can disappear when containers restart) and to provide seamless local MAMP/XAMPP integration, we've implemented a **dual database driver**:

1. **SQLite Mode (Default / Dev)**: Uses a local, serverless SQLite file (`database.db`). Perfect for rapid development, sandbox previews, and quick testing without database server overhead.
2. **MySQL Mode (Production / Persistent)**: Uses a persistent MySQL/MariaDB database (like local MAMP, XAMPP, or cloud-hosted MySQL). Essential for production so that added projects, blogs, and messages are persisted permanently and **never disappear**.

### 🔧 Switching to MySQL
To activate persistent MySQL storage, copy `.env.example` to `.env` and set:
```env
DB_TYPE="mysql"
DB_HOST="localhost"
DB_PORT=3306
DB_USER="root"
DB_PASSWORD="your_password"
DB_NAME="habtamu_gold_portfolio"
```

---

## 🔐 Production Hardening & Security Guidelines

For top-tier enterprise security, the system has been hardened with the following measures:

1. **Manual Entry Only**: The debug/testing auto-fill shortcuts (including the 3-tab passkey shortcut and consecutive click autofill) have been **completely removed** from the login page. Admin credentials must always be written manually.
2. **Secure Entry Route**: The login page entrance is hidden. It can only be accessed by **double-clicking** the discrete gold dot `.` in the header (`HABTAMU.`).
3. **Git Protection**: The `.gitignore` has been updated to securely exclude all private, environment, and dynamic data files from tracking. **Do NOT commit the following files to GitHub**:
   - `.env` & `.env.production` (Contains secrets, JWT keys, and database passwords)
   - `database.db` (The local SQLite database file containing test users and records)
   - `uploads/` (Folder containing uploaded admin PDFs, images, and resume attachments)

---

## 🚀 Quick Setup (MAMP / XAMPP + Node.js)

1. Start **MySQL** in your local server panel (MAMP or XAMPP).
2. Create a database named `habtamu_gold_portfolio` in **phpMyAdmin** or MySQL Workbench.
3. Import the `schema.sql` file to create the tables and seed them with premium content.
4. Set `DB_TYPE="mysql"` in `.env` and configure your credentials.
5. Run `npm install` and `npm run dev` to launch the site on `http://localhost:3000`!
