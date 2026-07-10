# 🚀 Local Setup Guide: VS Code + MAMP + MySQL + Node.js

This guide walks you through setting up and running **Habtamu Simeneh's Premium Portfolio & CMS System** locally on your machine using **MAMP**, **VS Code**, and **MySQL**.

---

## 💻 Amharic (የአማርኛ መመሪያ)
ይህ አፕሊኬሽን በኮምፒውተርዎ ላይ በቀላሉ ለመጫን እና በ **MySQL** እና **MAMP** ለመጠቀም የሚከተሉትን ቀላል ደረጃዎች ይከተሉ፡

1. **MAMP ይክፈቱ**: MAMP Control Panel ከፍተው **Apache** እና **MySQL** መጀመራቸውን (ማለትም አረንጓዴ መሆናቸውን) ያረጋግጡ።
2. **Database ይፍጠሩ**: browserዎ ላይ `http://localhost/phpmyadmin/` (ወይም በMAMP default port `http://localhost:8888/phpmyadmin/`) ይክፈቱ። 
   * አዲስ database `habtamu_gold_portfolio` በሚል ስም ይፍጠሩ። (ወይም ባዶ database ይፍጠሩ፣ አፕሊኬሽኑ ራሱ በራስ-ሰር ቴብሎችን እና መረጃዎችን የመፍጠር አቅም አለው!)
3. **ፕሮጄክቱን በ VS Code ይክፈቱ**: የወረደውን ፎልደር በ VS Code ውስጥ ይክፈቱት።
4. **Environment `.env` ፋይል ያዘጋጁ**: 
   * በፕሮጄክቱ ስር `.env` የሚል አዲስ ፋይል ይፍጠሩ እና ከታች ያለውን የኮንፊገሬሽን ኮድ ኮፒ አድርገው ያስገቡ።
   * **ማሳሰቢያ**: የ MAMP MySQL ፖርት በብዛት `8889` ወይም `3306` ነው። የ root ፓስወርድ ደግሞ `root` ነው።
5. **አፕሊኬሽኑን ያስጀምሩ**: በ VS Code Terminal ላይ በመክፈት የሚከተሉትን ትዕዛዞች ያሂዱ፡
   ```bash
   npm install
   npm run dev
   ```
6. **ይጠቀሙበት**: አፕሊኬሽኑ በተሳካ ሁኔታ ሲጀምር በ `http://localhost:3000` ላይ መግባት ይችላሉ!

---

## 🔌 1. Backend Configuration (`.env`)

Create a `.env` file in the root directory of the project and fill it with your MAMP/MySQL settings:

```env
# SERVER PORT
PORT=3000
NODE_ENV=development
JWT_SECRET=habtamu_gold_portfolio_secret_2026

# DATABASE CONFIGURATION (MAMP & MySQL)
# To use MySQL instead of SQLite, change DB_TYPE to "mysql"
DB_TYPE="mysql"
DB_HOST="localhost"
DB_PORT=8889          # MAMP default MySQL port is usually 8889 (or 3306 for default)
DB_USER="root"
DB_PASSWORD="root"    # MAMP default root password is "root"
DB_NAME="habtamu_gold_portfolio"
```

---

## 💾 2. Importing the Database Schema (Optional)

Our server **automatically handles database creation, table structure setup, and dummy/seed data populating** on the first run. 
However, if you want to import it manually:

1. Open **phpMyAdmin** through MAMP (usually at `http://localhost:8888/phpmyadmin/` or `http://localhost/phpmyadmin/`).
2. Create a database named `habtamu_gold_portfolio`.
3. Select the database, click the **Import** tab at the top.
4. Click **Choose File** and select the `schema.sql` file from the project root.
5. Click **Import** at the bottom.

---

## 📦 3. Installing Dependencies & Running

1. **Install Dependencies**: Open VS Code's integrated terminal and run:
   ```bash
   npm install
   ```
2. **Run the Server**:
   ```bash
   npm run dev
   ```
   * The dev server will automatically compile the frontend assets, establish a secure connection to your **MAMP MySQL database**, and serve everything on **`http://localhost:3000`**.

---

## 🔐 4. Default Admin Credentials

To manage your portfolio (add projects, write blogs, manage messages, edit settings, social links, and email icons):
* **Admin Login URL**: Go to `http://localhost:3000/#/admin/login` or click the **Admin Login** link in the footer.
* **Username**: `Habtamu simeneh`
* **Password**: `Habtish2121`

*Note: You can easily change your password and profile details once inside the Admin Dashboard by clicking the "Profile Settings" tab.*
