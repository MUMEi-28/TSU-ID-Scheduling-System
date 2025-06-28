# 🚀 Project Workflow Guidelines

This guide helps all contributors to properly **run, edit, push, pull, and collaborate** on the TSU ID Scheduling System using **GitHub Desktop** and **VS Code**.

---

## 📚 Table of Contents

- [🛠 Tools You Need](#-tools-you-need)
- [📁 Project Structure](#-project-structure)
- [🌱 Initial Setup](#-initial-setup)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🔧 Running the Frontend (React)](#-running-the-frontend-react)
- [🔧 Running the Backend (PHP + MySQL)](#-running-the-backend-php--mysql)
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
- [Node.js](https://nodejs.org/en) (v16 or higher for React)
- [XAMPP](https://www.apachefriends.org/index.html) (Apache + MySQL)
- A modern browser (Chrome, Edge, etc.)

---

## 📁 Project Structure

```
TSU-ID-Scheduling-System/
├── frontend/        # React + Vite + Tailwind
│   ├── src/
│   │   ├── Components/  # React components
│   │   └── config/      # API configuration
│   ├── .env             # Development environment variables
│   └── setup.js         # Setup wizard
├── backend/         # PHP + MySQL
│   ├── database/    # Database schema
│   └── config.php   # Database configuration
├── DEPLOYMENT_GUIDE.md  # Deployment instructions
└── GUIDELINES.md    # This file
```

---

## 🌱 Initial Setup

### Step 1: Clone the Repository

- Open [Repository](https://github.com/MUMEi-28/TSU-ID-Scheduling-System)
- Go to `File > Clone Repository`
- Choose a local folder to save it

### Step 2: Open in VS Code

- In GitHub Desktop, click `Open in Visual Studio Code`

---

## ⚙️ Environment Configuration

> **IMPORTANT**: Before running the frontend, you must configure the API base URL for your environment.

### Quick Setup (Recommended)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the setup wizard:
   ```bash
   npm run setup
   ```

3. Follow the interactive prompts to configure your environment.

### Manual Setup

If you prefer manual configuration, create a `.env` file in the `frontend` directory:

#### For XAMPP (Windows):
```env
VITE_API_BASE_URL=http://localhost/Projects/TSU-ID-Scheduling-System/backend
```

#### For WAMP (Windows):
```env
VITE_API_BASE_URL=http://localhost/tsu-scheduling/backend
```

#### For MAMP (Mac):
```env
VITE_API_BASE_URL=http://localhost:8888/tsu-scheduling/backend
```

#### For Linux Apache:
```env
VITE_API_BASE_URL=http://localhost/tsu-scheduling/backend
```

### Configuration Notes

- The system automatically detects your environment (development/production)
- For production deployment, create a `.env.production` file instead
- The API base URL should point to the directory containing your PHP backend files
- Restart the development server after changing environment variables

---

## 🔧 Running the Frontend (React)

1. **Configure your environment first** (see [Environment Configuration](#️-environment-configuration) above)

2. In VS Code terminal (open using `Ctrl + `` `):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

> **Note**: The default port is now 3000 (updated from 5173)

---

## 🔧 Running the Backend (PHP + MySQL)

1. Launch **XAMPP** and start:
   - Apache
   - MySQL

2. Place the backend folder in your web server directory:
   ```
   C:/xampp/htdocs/Projects/TSU-ID-Scheduling-System/backend
   ```
   
   > **Note**: The path should match your frontend configuration

3. Import the database:
   - Open `http://localhost/phpmyadmin`
   - Create database: `tsu_scheduling_system` (or your preferred name)
   - Import `schema.sql` from `backend/database/`

4. Configure database connection:
   - Edit `backend/config.php` with your database credentials
   - Ensure the database name matches what you created

5. Test backend access:
   ```
   http://localhost/Projects/TSU-ID-Scheduling-System/backend/login.php
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

### Committing Your Code

Write clear, meaningful commit messages:
```bash
feat: add calendar slot selection
fix: correct invalid input warning
docs: update configuration guide
```

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

---

## 🧼 Code Guidelines

### JavaScript + React
- Use `const`, `let`, arrow functions
- Use meaningful component/variable names
- Keep files modular and reusable
- Use the centralized API configuration system
- Import API functions from `src/config/api.js`

### PHP
- Use `filter_input()` or similar for validation
- Organize logic in separate files/functions
- Include proper CORS headers for cross-origin requests

### MySQL
- Use clear table/column names
- Index important fields (e.g., student number)

### API Configuration
- Never hardcode URLs in components
- Use the `buildApiUrl()` function from `src/config/api.js`
- Use `API_ENDPOINTS` constants for endpoint names

---

## ❌ Files You Should Never Push

These are already in `.gitignore`, but double-check before committing:

- `.env` (development environment variables)
- `.env.production` (production environment variables)
- `node_modules/`
- `*.log`
- `.vscode/`
- `*.DS_Store`
- `dist/` (build output)

---

## 🆘 Common Issues

| Problem                        | Solution                                           |
|-------------------------------|----------------------------------------------------|
| Port 3000 already in use       | Close other projects or change port in `vite.config.js` |
| "Network Error" in frontend    | Check `.env` file configuration and backend URL    |
| API returns CORS error         | Check CORS headers in backend PHP files           |
| Cannot connect to DB          | Check DB credentials in `backend/config.php`      |
| Environment not detected      | Restart dev server after changing `.env` file     |
| Conflicts when pushing        | Pull first, resolve, then push                    |
| Changes not showing           | Restart `npm run dev` or refresh browser          |
| Setup wizard not working      | Ensure Node.js is installed and run `npm install` first |

### Troubleshooting Network Errors

If you encounter network errors:

1. **Check your `.env` file**:
   - Verify the `VITE_API_BASE_URL` is correct
   - Ensure the URL points to your backend directory

2. **Test backend accessibility**:
   - Open the backend URL in your browser
   - Check if Apache and MySQL are running

3. **Verify file paths**:
   - Ensure backend files are in the correct web server directory
   - Check file permissions

4. **Check CORS configuration**:
   - Ensure backend PHP files include proper CORS headers
   - For production, ensure frontend and backend are on same domain

---

## 📚 Additional Resources

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Comprehensive deployment instructions
- [frontend/README.md](./frontend/README.md) - Frontend-specific documentation
- [frontend/config.txt](./frontend/config.txt) - Configuration examples

---

**Happy Coding! 🚀**


