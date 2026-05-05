# Tracksy — Renewal Management Dashboard

A full-stack subscription and renewal tracking application.

## Project Structure

```
Renewal Automation/
├── tracksy-fresh/       ← Laravel 11 REST API (PHP backend)
├── renewal-dashboard/   ← React + Vite frontend
└── README.md
```

---

## Quick Start

### Prerequisites
- PHP 8.2+ (via XAMPP: https://www.apachefriends.org)
- Composer (https://getcomposer.org)
- Node.js 18+ (https://nodejs.org)

### 1. Start the Backend

```bash
cd tracksy-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend runs at: http://localhost:8000

### 2. Start the Frontend

Open a second terminal:

```bash
cd renewal-dashboard
npm install
npm run dev
```

Frontend runs at: http://localhost:5173 (or http://127.0.0.1:5173)

### 3. Open the App

Go to http://127.0.0.1:5173 in your browser and sign up.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Laravel 11, PHP 8.2 |
| Auth | Laravel Sanctum (Bearer tokens) |
| Database | SQLite (file-based, no server needed) |
| HTTP Client | Axios |
| Testing | Vitest, fast-check (property-based) |

---

## Environment Variables

### Backend (`tracksy-backend/.env`)
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
DB_CONNECTION=sqlite
```

### Frontend (`renewal-dashboard/.env`)
```
VITE_API_URL=http://localhost:8000
```
