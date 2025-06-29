# 🤝 Contributing to TSU ID Scheduling System

This guide outlines the rules, expectations, and best practices for contributing.

---

## 📌 Project Overview

This system is built to:  
-Update later

---

## 🧠 Contribution Guidelines

### 1. 📁 Branch Naming Convention
Use clear and descriptive names:
- `feature/<feature-name>`
- `fix/<bug-description>`
- `refactor/<code-improvement>`
- `docs/<documentation-change>`

### 2. ✅ Commit Message Format
Follow this structure for commit messages:
- `feat: add booking calendar`
- `fix: resolve slot overlap issue`
- `docs: update README with instructions`
- `style: apply Tailwind classes to booking UI`
- `refactor: separate booking logic into component`
- `test: Adding or updating tests`

Avoid vague messages like “update code” or “fixed stuff.”

---

## 👩‍💻 Code Standards

### Frontend
- Use **React + Tailwind CSS + JavaScript**
- Follow component-based design principles
- Use Prettier to avoid repeated CSS

### Backend
- Use PHP/MySQL
- Validate inputs and handle errors gracefully

---

## 🧪 Testing Your Code
- Test your code thoroughly before opening a Pull Request (PR)
- Try different use cases (e.g., overlapping bookings)
- If possible, test on both desktop and mobile

---

## 🔐 Security & Validation  
- Do **not** commit any sensitive data (e.g., `.env`, passwords)

---

## 📦 Feature You Can Work On  
- List update here later

---


## 📁 Folder Structure

```markdown
rfid-scheduling-system/
├── backend/
│   ├── api/
│   │   ├── connect.php
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── booking.php
│   │   └── admin/
│   │       ├── complete-slot.php
│   │       ├── fail-slot.php
│   │       └── get-report.php
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── uploads/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── BookingPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── TermsAndConditions.jsx
│       ├── services/
│       │   ├── bookingService.js
│       │   └── authService.js
│       ├── context/
│       ├── App.jsx
│       └── main.jsx
│
├── docs/
│   ├── CONTRIBUTING.md
│   ├── README.md
│   ├── LICENSE
│   └── wireframe-sketches.png
│
├── .gitignore
├── .env
├── composer.json
├── package.json
└── index.php
```
---

## 🧰 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | ReactJS, TailwindCSS, JavaScript  |
| Backend   | PHP (Laravel recommended)         |
| Database  | MySQL                             |
| Hosting   | InfinityFree, Netlify, Vercel     |

---

## 🙋 Need Help?
If you're unsure about anything:
- Create an issue titled **[QUESTION]**
- Or ask in our group chat or during sync meetings
