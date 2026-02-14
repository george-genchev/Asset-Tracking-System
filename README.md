# Asset Tracking System

Frontend scaffold for a FinTech asset tracking app.

## Tech Stack
- Vite + Vanilla JavaScript
- Bootstrap 5
- Supabase (planned backend)

## Pages and Routing
- Hash-based routing: `#/` and `#/dashboard`
- Other page folders exist as stubs: login, register, strategies, assets
- Each page sets its own document title in its page module

## Project Structure
- src/components: header and footer (HTML/CSS/JS)
- src/pages: page modules (HTML/CSS/JS)
- src/router.js: simple hash router and layout composition

## Scripts
- npm run dev: start local dev server
- npm run build: build for production
- npm run preview: preview production build

## Getting Started
1. npm install
2. npm run dev

## Notes
- Update routes in src/router.js when enabling more pages.
- Supabase integration will be added in future steps.
