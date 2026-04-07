# BlogSpace v2.0

A modern, full-featured blog application built with **Node.js**, **Express**, **MongoDB**, and **EJS**.

---

## 🚀 Features

### Authentication
- User registration & login with bcrypt password hashing
- Session-based authentication (7-day persistent sessions)
- Flash messages for feedback
- Protected routes — only logged-in users can create/edit/delete posts

### Dashboard
- Personal analytics: total posts, views, likes, comments
- Post management table with status filtering (All / Published / Drafts)
- One-click edit and delete from the dashboard

### Blog Features
- Create, edit, delete posts with category, tags, and draft/published status
- Like posts (AJAX — no page reload)
- Comment system
- View counter
- Related posts by category
- Word count & estimated read time on the editor
- Search posts by title, content, or tags
- Filter by category or tag
- Sort by newest, oldest, most viewed, most liked

### UI / UX
- Clean modern design with Inter + Merriweather fonts
- **Dark mode** (persists across sessions via localStorage)
- Fully responsive — mobile, tablet, desktop
- Sticky navbar with search, user avatar dropdown
- Flash messages with auto-dismiss
- 404 and 500 error pages

---

## 📁 Project Structure

```
blog-app/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, logout
│   │   ├── postController.js    # CRUD, likes, comments
│   │   └── dashboardController.js # Dashboard stats & settings
│   ├── middleware/
│   │   └── auth.js              # protect, redirectIfLoggedIn, setCurrentUser
│   ├── models/
│   │   ├── User.js              # User schema with bcrypt
│   │   └── Post.js              # Post schema with comments & likes
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── dashboardRoutes.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── css/style.css        # Full modern CSS with dark mode
│   │   └── js/main.js           # Dark mode, dropdowns, AJAX likes, etc.
│   └── views/
│       ├── layouts/main.ejs
│       ├── partials/
│       │   ├── header.ejs
│       │   └── footer.ejs
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── login.ejs
│       │   │   └── register.ejs
│       │   ├── index.ejs        # Home page
│       │   ├── show.ejs         # Single post
│       │   ├── create.ejs       # Create post form
│       │   ├── edit.ejs         # Edit post form
│       │   ├── dashboard.ejs    # User dashboard
│       │   └── settings.ejs     # Account settings
│       └── error.ejs
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Steps

```bash
# 1. Navigate into the project
cd blog-app

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit .env and set your MongoDB URI and a secure SESSION_SECRET
# Example:
#   MONGODB_URI=mongodb://localhost:27017/blog_app_v2
#   SESSION_SECRET=some_long_random_string_here

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:5000
```

---

## 📦 New Dependencies

| Package | Purpose |
|---|---|
| `bcryptjs` | Password hashing |
| `express-session` | Session management |
| `connect-flash` | Flash messages |
| `express-validator` | Form validation |
| `method-override` | PUT/DELETE in HTML forms |

---

## 🗄️ Database Schema Changes

### User (new)
```
name, email, password (hashed), bio, avatar, role, website, timestamps
```

### Post (updated)
```
title, content, excerpt, author (ref: User), category, tags[],
status, views, likes[userId], comments[{user, userName, text}],
coverImage, readTime, timestamps
```

---

## 🔐 Security Notes

- Change `SESSION_SECRET` in `.env` to a long random string in production
- Use MongoDB Atlas with authentication for production databases
- Add HTTPS in production (use a reverse proxy like nginx)
