# Asset Tracking System

A comprehensive FinTech application for managing and tracking financial assets with Supabase authentication and PostgreSQL backend.

## Tech Stack
- **Frontend:** Vite + Vanilla JavaScript (ES modules)
- **UI:** Bootstrap 5.3 + Custom CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Routing:** Hash-based SPA router

## Features
- ✅ User registration and login with email/password
- ✅ Role-based access control (admin/user)
- ✅ Secure portfolio tracking with RLS
- ✅ Multiple investment strategies
- ✅ Asset management with targets and order types
- ✅ Seed data with 3 demo users and realistic investments
- ✅ Responsive design for mobile and desktop

## Pages and Routing

### Public Pages
- `/` - Landing page with feature highlights
- `/register` - User registration form
- `/login` - User login form

### Protected Pages
- `/dashboard` - Portfolio overview and management
- `/strategies` - Investment strategies (planned)
- `/assets` - Asset management (planned)

## Project Structure
```
src/
├── components/
│   ├── header/     (Navigation)
│   └── footer/     (Footer)
├── pages/
│   ├── index/       (Landing page)
│   ├── login/       (Login form)
│   ├── register/    (Register form)
│   ├── dashboard/   (Portfolio dashboard)
│   ├── strategies/  (Strategies page - stub)
│   └── assets/      (Assets page - stub)
├── lib/
│   └── supabase.js  (Auth & Supabase client)
├── main.js          (App entry point)
├── router.js        (Hash-based router)
└── styles.css       (Global styles)
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials from your project settings
3. See [AUTH_SETUP.md](AUTH_SETUP.md) for detailed instructions

### 3. Run Development Server
```bash
npm run dev
```
Server runs on `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

## Demo Accounts

Pre-seeded demo accounts for testing:

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | Admin |
| bob@example.com | password123 | User |
| carol@example.com | password123 | User |

Quick test: Go to `/login`, click a demo account button, and sign in.

## Database Schema

### Users & Authentication
- `auth.users` - Supabase Auth users
- `public.user_roles` - Role assignments (admin/user)

### Financial Data
- `public.strategies` - Investment strategies (owned by users)
- `public.assets` - Assets in strategies (ticker, quantity, exchange, etc.)
- `public.targets` - Asset targets (Open Position, Close Position, Rebalancing)
- `public.orders` - Order types (Market, Market OPG)

### Security
- Row-Level Security (RLS) policies on all tables
- Users can only see their own strategies and assets
- Admins have full access

## Authentication Flow

```
User Registration/Login
         ↓
   Form Validation
         ↓
   Supabase Auth
         ↓
  JWT Token Stored
         ↓
   Redirect to Dashboard
```

## Available Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally

## Documentation

- [AUTH_SETUP.md](AUTH_SETUP.md) - Complete authentication setup guide
- [SEED_DATA_SUMMARY.md](SEED_DATA_SUMMARY.md) - Demo data and seed information

## Notes
- Hash-based routing allows deployment without server-side rewrites
- Environment variables must start with `VITE_` to be accessible in browser
- Auto-confirm demo users for immediate testing (real auth requires email confirmation)
- See AUTH_SETUP.md for troubleshooting and auth function documentation
