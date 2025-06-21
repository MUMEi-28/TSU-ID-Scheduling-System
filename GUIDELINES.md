# 🚀 Project Workflow Guidelines

This guide will help you and your team collaborate effectively using **GitHub Desktop** and **VS Code** for the TSU RFID Scheduling System.

---

## 🛠 Tools You Need

- [GitHub Desktop](https://desktop.github.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- XAMPP / PHP server (for PHP backend)
- MySQL (included in XAMPP)

---

## 📁 Project Structure

```
rfid-scheduling-system/
├── frontend/    # React app
├── backend/     # PHP API
├── docs/        # Documentation
├── .env         # Local environment variables (do not push this!)
```

---

## 🌱 Initial Setup

1. **Clone the repository:**

   Open **GitHub Desktop**  
   → Click **File > Clone Repository**  
   → Choose the repo  
   → Clone to your desired folder

2. **Open in VS Code:**

   In GitHub Desktop  
   → Click `Open in Visual Studio Code`

---

## 🔧 Running the Frontend (React)

1. Open Terminal in VS Code:
   ```
   cd frontend
   npm install
   npm run dev
   ```

2. Access the site:
   - Go to `http://localhost:5173`

---

## 🔧 Running the Backend (PHP + MySQL)

1. Start **XAMPP** and turn on:
   - Apache
   - MySQL

2. Place `backend/` files inside:
   ```
   C:/xampp/htdocs/rfid-scheduling-system/backend
   ```

3. Access API:
   - e.g. `http://localhost/rfid-scheduling-system/backend/api/login.php`

4. Import the database:
   - Open `phpMyAdmin`
   - Create database: `rfid_system`
   - Import from `backend/database/schema.sql`

---

## 🌿 Branching Guidelines

> Never push directly to `main`.

### To create a feature branch:

1. In GitHub Desktop:
   - Click `Current Branch` → `New Branch`
   - Name it using this format:

     ```
     feature/booking-form
     fix/login-validation
     docs/update-readme
     ```

2. After working, **commit your changes**:
   - Write a clear commit message like:
     ```
     feat: add booking form with calendar
     ```

3. **Push the branch**:
   - Click `Push origin` in GitHub Desktop

4. **Open a Pull Request (PR)**:
   - Go to GitHub.com → Click `Compare & Pull Request`

---

## 🔄 Syncing Changes (Pulling Updates)

> Always pull before starting a task.

1. In GitHub Desktop:
   - Click `Fetch origin` then `Pull origin/main`

2. If you have a branch:
   - Pull latest from main into your branch:
     ```
     git checkout your-branch-name
     git merge main
     ```

---

## 🧼 Code Guidelines

- Keep commits small and meaningful
- Test before pushing
- Avoid pushing unnecessary files (`.env`, `node_modules`, `.vscode`)

---

## ❌ Files You Should Never Push

- `.env`
- `node_modules/`
- `*.log`
- `*.DS_Store`

These are already in `.gitignore`, but double-check before committing.

---

## 🆘 Common Issues

| Problem                        | Solution                                      |
|-------------------------------|-----------------------------------------------|
| Conflicts when pushing        | Pull first, resolve conflicts, then push      |
| API not working               | Check if Apache/MySQL are running in XAMPP   |
| Changes not showing on site   | Run `npm run dev` again or clear browser cache |

---

## 🧠 Tips

- Create a branch for each task.
- Avoid pushing directly to `main`.
- Use descriptive commit messages.
- Coordinate in group chat to avoid merge conflicts.

---

