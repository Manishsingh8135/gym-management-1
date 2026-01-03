# GymPro - Complete Gym Management System

A modern, full-featured gym management system built with Next.js (frontend) and Express.js (backend).

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken + bcryptjs)

## 📁 Project Structure

```
gym-management/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities & API client
│   │   ├── stores/    # Zustand stores
│   │   └── types/     # TypeScript types
│   └── ...
│
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── controllers/# Request handlers
│   │   ├── services/  # Business logic
│   │   ├── middlewares/# Express middlewares
│   │   └── config/    # Configuration
│   ├── prisma/        # Database schema
│   └── ...
│
└── plan/              # Planning documentation
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- pnpm

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at: http://localhost:3000

### Backend Setup

```bash
cd backend
pnpm install

# Set up database
pnpm db:generate
pnpm db:push

# Start server
pnpm dev
```

Backend runs at: http://localhost:5000

## 🎨 Features

### Implemented
- ✅ Modern dashboard with stats, quick actions, activity feed
- ✅ Members management (list, search, filters)
- ✅ Beautiful login page
- ✅ Responsive sidebar navigation
- ✅ Dark sidebar with emerald accent theme
- ✅ Complete database schema (30+ tables)
- ✅ JWT authentication system
- ✅ RESTful API structure

### Planned
- 🔄 Member registration (multi-step form)
- 🔄 Membership plans management
- 🔄 Payment collection & invoicing
- 🔄 Class scheduling & booking
- 🔄 Attendance check-in (QR code)
- 🔄 Trainer management
- 🔄 Reports & analytics
- 🔄 Notifications system
- 🔄 Lead management (CRM)
- 🔄 Inventory & POS

## 🎨 Design

- **Primary Color**: Emerald (#10B981)
- **Dark Sidebar**: Always dark for professional look
- **Modern UI**: Clean, minimal, and responsive

## 📚 API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### Members
- `GET /api/v1/members` - List members
- `GET /api/v1/members/:id` - Get member
- `POST /api/v1/members` - Create member
- `PATCH /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member

### Dashboard
- `GET /api/v1/dashboard/stats` - Get statistics
- `GET /api/v1/dashboard/recent-activity` - Get activity

## 📄 License

MIT
