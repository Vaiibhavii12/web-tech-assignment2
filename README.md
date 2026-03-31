# ⚡ TaskFlow Pro — MERN Stack Project Manager

> **Final Year B.Tech Project** | Full-Stack Web Application  
> Built with MongoDB · Express.js · React · Node.js

---

## 🚀 Live Features

| Feature | Description |
|---|---|
| 🔐 **User Auth** | JWT-based Register/Login with bcrypt hashing |
| 📁 **Projects CRUD** | Create, Read, Update, Delete projects with icons & colors |
| ✅ **Tasks CRUD** | Full task management with priority, status, due dates, tags |
| 🎯 **Kanban Board** | Drag & Drop tasks across Todo → In Progress → Review → Done |
| 📊 **Analytics** | Real-time charts: completion rate, status breakdown, project health |
| 🔍 **Filters** | Filter tasks by status, priority, project, and search |
| 📱 **Responsive** | Works perfectly on mobile, tablet, and desktop |
| 🌙 **Dark Theme** | Elegant dark UI with glassmorphism and gradient effects |

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — ODM for database
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing (12 rounds)
- **express-validator** — Input validation

### Frontend
- **React 18** — UI library with hooks
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client with interceptors
- **Lucide React** — Icon library
- **React Hot Toast** — Notifications
- **date-fns** — Date formatting

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js          ← Mongoose User schema + JWT methods
│   │   ├── Project.js       ← Project schema with progress calc
│   │   └── Task.js          ← Task schema with comments
│   ├── routes/
│   │   ├── auth.js          ← Register, Login, Profile
│   │   ├── projects.js      ← Full CRUD + stats
│   │   └── tasks.js         ← Full CRUD + comments + status patch
│   ├── middleware/
│   │   └── auth.js          ← JWT protect middleware
│   ├── .env.example
│   └── server.js            ← Express app entry point
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── auth/ProtectedRoute.jsx
        │   ├── layout/AppLayout.jsx    ← Sidebar + Topbar
        │   ├── projects/ProjectModal.jsx
        │   └── tasks/TaskModal.jsx
        ├── context/AuthContext.jsx      ← Global auth state
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx        ← Stats + recent activity
        │   ├── ProjectsPage.jsx         ← Projects grid
        │   ├── ProjectDetailPage.jsx    ← Kanban + List view
        │   ├── TasksPage.jsx            ← All tasks with filters
        │   ├── AnalyticsPage.jsx        ← Charts & metrics
        │   └── SettingsPage.jsx         ← User profile
        ├── utils/
        │   ├── api.js                   ← Axios instance + interceptors
        │   └── helpers.js               ← Constants + formatters
        ├── App.jsx                      ← Routes
        ├── index.js
        └── index.css                    ← Custom Tailwind + global styles
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### Step 1 — Clone the repo
```bash
git clone https://github.com/yourusername/taskflow-pro.git
cd taskflow-pro
```

### Step 2 — Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev    # development (nodemon)
npm start      # production
```

✅ Backend runs on `http://localhost:5000`

---

### Step 3 — Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start React:
```bash
npm start
```

✅ Frontend runs on `http://localhost:3000`

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project + tasks |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + tasks |
| GET | `/api/projects/:id/stats` | Project statistics |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with filters) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/status` | Update status only (Kanban drag) |
| POST | `/api/tasks/:id/comments` | Add comment |

---

## 🚀 Deployment

### Deploy Backend (Render)
1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set environment variables in Render dashboard
4. Build command: `npm install`
5. Start command: `node server.js`
6. Use MongoDB Atlas for cloud database

### Deploy Frontend (Vercel)
1. Push frontend to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `REACT_APP_API_URL` to your Render backend URL
4. Deploy!

### MongoDB Atlas Setup
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Replace `MONGO_URI` in `.env`

---

## 🎨 Design Highlights

- **Dark glassmorphism UI** with layered transparency and blur effects
- **Playfair Display** display font + **DM Sans** body font
- **Custom CSS animations**: slide-up, fade-in, shimmer skeleton loading
- **Drag & Drop Kanban** using HTML5 native DnD API
- **SVG donut charts** in Analytics with CSS animation
- **Responsive sidebar** that collapses on mobile and desktop
- **Custom scrollbar** styling matching the theme
- **Toast notifications** with branded styling

---

## 🏗️ Advanced Features

- ✅ Auto-progress calculation when tasks change status
- ✅ JWT token interceptor — auto-logout on 401
- ✅ Skeleton loading states on all pages
- ✅ Password strength indicator on register
- ✅ Drag & Drop with visual feedback (drag-over highlight)
- ✅ Inline status toggle on task list (click circle to advance status)
- ✅ Task comments API ready
- ✅ Tags system for both projects and tasks
- ✅ Priority badges with color coding
- ✅ Overdue detection with warning indicators

---

## 📝 Academic Information

- **Project Type**: B.Tech Final Year Mega Project
- **Stack**: MERN (MongoDB, Express, React, Node.js)
- **Authentication**: Custom JWT (no Firebase/Supabase)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Render (backend) + Vercel (frontend) + MongoDB Atlas

---

*Built with ❤️ for B.Tech Final Year — 2025*
