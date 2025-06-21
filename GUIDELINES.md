# 🚀 Project Workflow Guidelines

This guide helps all contributors to properly **run, edit, push, pull, and collaborate** on the RFID Scheduling System using **GitHub Desktop** and **VS Code**.

---

## 📚 Table of Contents

- [🛠 Tools You Need](#-tools-you-need)
- [📁 Project Structure](#-project-structure)
- [🌱 Initial Setup](#-initial-setup)
- [🔧 Running the Frontend (React)](#-running-the-frontend-react)
- [🔧 Running the Backend (PHP--MySQL)](#-running-the-backend-php--mysql)
- [🌿 Branching Guidelines](#-branching-guidelines)
- [🔄 Pulling & Syncing Updates](#-pulling--syncing-updates)
- [🧼 Code Guidelines](#-code-guidelines)
- [❌ Files You Should Never Push](#️-files-you-should-never-push)
- [🆘 Common Issues](#-common-issues)

---

## 🛠 Tools You Need

Install the following:

- [GitHub Desktop](https://desktop.github.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/en) (For React)
- [XAMPP](https://www.apachefriends.org/index.html) (Apache + MySQL)
- A modern browser (Chrome, Edge, etc.)

---

## 📁 Project Structure

```
rfid-scheduling-system/
├── frontend/        # React + Tailwind
├── backend/         # PHP + MySQL
├── docs/            # README, Guidelines, Screenshots
├── .env             # Local secrets (DO NOT push this)
```

---

## 🌱 Initial Setup

### Step 1: Clone the Repository

- Open [Repository](https://github.com/MUMEi-28/TSU-ID-Scheduling-System)
  
![image](https://github.com/user-attachments/assets/5cb5daa6-7cb1-4c66-bd34-f2ba577a4069)
- Go to `File > Clone Repository`
- Choose a local folder to save it

---

### Step 2: Open in VS Code

- In GitHub Desktop, click `Open in Visual Studio Code`
![image](https://github.com/user-attachments/assets/52310414-9603-406b-94a4-3a8e690e4b80)

---

## 🔧 Running the Frontend (React)

1. In VS Code terminal:

   -Open terminal using `ctrl + backtick` (ctrl + `)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser and visit:
   ```
   http://localhost:5173
   ```

![image](https://github.com/user-attachments/assets/7aa266cb-33af-4d99-9b18-22082a127f01)

---

## 🔧 Running the Backend (PHP + MySQL)

1. Launch **XAMPP** and start:
   - Apache
   - MySQL

🖼️ ![XAMPP Screenshot](<insert-your-screenshot-url-here>)

2. Place the backend folder in:
   ```
   C:/xampp/htdocs/rfid-scheduling-system/backend
   ```

3. Import the database:
   - Open `http://localhost/phpmyadmin`
   - Create database: `rfid_system`
   - Import `schema.sql` from `backend/database/`

4. Access the backend APIs:
   ```
   http://localhost/rfid-scheduling-system/backend/api/login.php
   ```

---

## 🌿 Branching Guidelines

> NEVER push directly to `main`.

### Creating a Branch:

1. In GitHub Desktop:
   - Click `Current Branch > New Branch`
   - Name it like:

     ```
     feature/booking-form
     fix/login-error
     docs/update-readme
     ```

🖼️ ![Branching Screenshot](<insert-your-screenshot-url-here>)

---

### Committing Your Code

Write clear, meaningful commit messages:
```bash
feat: add calendar slot selection
fix: correct invalid input warning
```

🖼️ ![Commit Screenshot](<insert-your-screenshot-url-here>)

---

### Pushing Your Work

1. In GitHub Desktop:
   - Click `Push origin`
2. On GitHub.com:
   - Create a Pull Request (PR)

---

## 🔄 Pulling & Syncing Updates

> Always pull before starting work to avoid conflicts.

1. In GitHub Desktop:
   - Click `Fetch origin`
   - Then click `Pull origin/main`

2. To merge `main` into your branch:

```bash
git checkout your-branch-name
git merge main
```

🖼️ ![Pulling Screenshot](<insert-your-screenshot-url-here>)

---

## 🧼 Code Guidelines

### JavaScript + React
- Use `const`, `let`, arrow functions
- Use meaningful component/variable names
- Keep files modular and reusable

### PHP
- Use `filter_input()` or similar for validation
- Organize logic in separate files/functions

### MySQL
- Use clear table/column names
- Index important fields (e.g., student number)

---

## ❌ Files You Should Never Push

These are already in `.gitignore`, but double-check before committing:

- `.env`
- `node_modules/`
- `*.log`
- `.vscode/`
- `*.DS_Store`

---

## 🆘 Common Issues

| Problem                        | Solution                                           |
|-------------------------------|----------------------------------------------------|
| Port 5173 already in use       | Close other projects or change port in `vite.config.js` |
| API returns error              | Check Apache & MySQL are running                  |
| Cannot connect to DB          | Check DB credentials and `.env` file              |
| Conflicts when pushing        | Pull first, resolve, then push                    |
| Changes not showing           | Restart `npm run dev` or refresh browser          |

---


