# Event Management System

A full-stack web app for discovering events, registering for tickets, and managing them as an organizer or administrator. The UI is a React single-page app; the API is an Express server backed by SQLite with real-time updates via Socket.IO.

## Features

- **Attendees:** Browse events, view details, register (with waitlist when full), dashboard with tickets and recommendations, account settings.
- **Organizers / admins:** Create events (`/events/new`), role-based access.
- **Admin console** (`/admin`): Overview, events, users, registrations, memberships, moderation, analytics, settings.
- **Auth:** Email/password and optional Google OAuth (Passport); JWT sessions.
- **Payments:** Stripe integration for membership tiers (Premium/VIP) and webhooks.
- **Email:** Optional SMTP for transactional email (see env).
- **Real time:** Socket.IO for live event-room updates (client authenticates with JWT when present).

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4, Framer Motion, Recharts |
| Backend  | Node.js 18+, Express, better-sqlite3, Socket.IO, Passport, Stripe, Zod |
| Data     | SQLite (`server/data/events.db`, WAL mode) |

## Prerequisites

- [Node.js](https://nodejs.org/) **18 or newer**
- npm (comes with Node)

## Project layout

```
Event_Management_System/
├── client/          # Vite + React app (dev server proxies /api → API)
├── server/          # Express API + SQLite + migrations on startup
│   ├── .env.example # Copy to .env and adjust
│   └── data/        # SQLite database files (created automatically)
└── README.md
```

## Quick start

### 1. API (server)

```bash
cd server
cp .env.example .env
# Edit .env: at minimum CLIENT_URL should match the frontend (default http://localhost:5173).
# For production, set JWT_SECRET and other secrets (see .env.example).
npm install
npm run dev
```

The API listens on **port 4000** by default (`PORT` in `.env`). Health check: `GET http://localhost:4000/api/health`.

### 2. Web app (client)

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to `http://localhost:4000`.

### 3. Optional: seed data

With the server’s dependencies installed and `.env` in place:

```bash
cd server
npm run db:seed
```

You can override seed credentials with `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_USER_EMAIL`, and `SEED_USER_PASSWORD` in `.env` (see `server/.env.example`).

## Environment variables (server)

Copy `server/.env.example` to `server/.env`. Important entries:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `4000`) |
| `CLIENT_URL` | Allowed CORS origin and Socket.IO origin (default `http://localhost:5173`) |
| `DATABASE_PATH` | SQLite file path (default `./data/events.db`) |
| `JWT_SECRET` | **Required in production** — signing key for JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `GOOGLE_*` | Google OAuth (optional) |
| `STRIPE_*` | Stripe payments and webhooks (optional for local UI-only dev) |
| `SMTP_*` / `EMAIL_FROM` | Outbound email (optional) |

## Production build (client)

```bash
cd client
npm run build
npm run preview   # optional local preview of the static build
```

Serve the built assets with any static host and ensure API requests go to your deployed API URL (you may need a reverse proxy or env-based API base URL for production).

## Scripts reference

| Location | Command | Description |
|----------|---------|-------------|
| `server` | `npm run dev` | Run API with `--watch` |
| `server` | `npm start` | Run API without watch |
| `server` | `npm run db:seed` | Seed demo users/data |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production build |
| `client` | `npm run lint` | ESLint |

## License

Private / unlicensed unless you add a license file.
