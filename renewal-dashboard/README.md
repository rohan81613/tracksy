# Tracksy Frontend — React + Vite

## Folder Structure

```
renewal-dashboard/src/
├── api.js                          ← Axios client (auth headers, key mapping, error handling)
├── App.jsx                         ← Root component and page router
├── main.jsx                        ← React entry point
├── index.css                       ← Global styles (Tailwind)
│
├── context/
│   ├── AuthContext.jsx             ← Auth state: login, signup, logout, profile
│   └── RenewalContext.jsx          ← App state: renewals, stats, categories, notifications
│
├── pages/
│   ├── AuthGate.jsx                ← Redirects unauthenticated users to login
│   ├── Login.jsx                   ← Login page
│   ├── Signup.jsx                  ← Signup page
│   ├── Dashboard.jsx               ← Main dashboard with stats + renewals table
│   ├── Renewals.jsx                ← Full renewals list page
│   ├── Calendar.jsx                ← Calendar view of renewal dates
│   ├── Settings.jsx                ← Profile and password settings
│   └── VendorProfile.jsx           ← Per-vendor renewal aggregation view
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx              ← Top nav bar with user menu + notifications
│   │   └── Sidebar.jsx             ← Left navigation sidebar
│   ├── dashboard/
│   │   └── StatsCards.jsx          ← Total / Upcoming / Overdue / Spend cards
│   ├── renewals/
│   │   ├── RenewalsTable.jsx       ← Sortable renewals data table
│   │   ├── RenewalForm.jsx         ← Add / Edit renewal modal form
│   │   ├── ViewRenewal.jsx         ← Read-only renewal detail view
│   │   └── DeleteConfirm.jsx       ← Delete confirmation dialog
│   ├── import/
│   │   └── ImportModal.jsx         ← CSV upload, preview, and bulk import
│   ├── notifications/
│   │   └── NotificationDropdown.jsx ← Bell icon with renewal alerts
│   ├── calendar/
│   │   └── CalendarView.jsx        ← Monthly calendar component
│   └── ui/                         ← Reusable design system components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       ├── Select.jsx
│       ├── Badge.jsx
│       ├── Card.jsx
│       ├── Skeleton.jsx
│       ├── Toast.jsx
│       └── CategorySelect.jsx
│
├── utils/
│   ├── renewalUtils.js             ← Status calculation, date helpers
│   ├── importUtils.js              ← CSV parsing logic
│   └── reportGenerator.js          ← CSV and PDF export
│
└── test/
    └── setup.js                    ← Vitest + Testing Library setup
```

## Key Concepts

- `api.js` is the single HTTP client — all API calls go through it
- `AuthContext` manages the logged-in user and token (`tracksy_token` in localStorage)
- `RenewalContext` manages all app data and exposes CRUD functions to components
- Components never call the API directly — they use context functions

## Running Locally

```bash
npm install
npm run dev
```

## Running Tests

```bash
npm test
```

## Environment Variables

Create a `.env` file (copy from `.env.example`):
```
VITE_API_URL=http://localhost:8000
```
