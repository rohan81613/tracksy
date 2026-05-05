# Tracksy Backend — Laravel 11 REST API

## Folder Structure

```
tracksy-backend/
├── app/
│   ├── Console/Commands/
│   │   └── SendRenewalReminders.php   ← Scheduled email reminder command
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php     ← Register, login, logout, profile
│   │   │   ├── CategoryController.php     ← CRUD for user categories
│   │   │   ├── NotificationController.php ← In-app renewal alerts
│   │   │   └── RenewalController.php      ← CRUD + stats + bulk import
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   └── RenewalRequest.php         ← Validation rules for renewals
│   │   └── Resources/
│   │       ├── RenewalResource.php        ← API response shape for renewals
│   │       └── UserResource.php           ← API response shape for users
│   ├── Mail/
│   │   └── RenewalReminderMail.php        ← Email template class
│   ├── Models/
│   │   ├── Category.php
│   │   ├── Renewal.php                    ← Core model with computed attributes
│   │   └── User.php
│   └── Policies/
│       └── RenewalPolicy.php              ← Ensures users only access own renewals
├── config/
│   └── cors.php                           ← CORS allowed origins config
├── database/
│   ├── migrations/                        ← Database schema history
│   └── database.sqlite                    ← SQLite database file (auto-created)
├── resources/views/emails/
│   └── renewal-reminder.blade.php         ← Email HTML template
├── routes/
│   ├── api.php                            ← All API endpoints
│   └── console.php                        ← Scheduler registration
└── bootstrap/
    └── app.php                            ← App config (middleware, routing)
```

## API Endpoints

### Auth (public)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |

### Auth (protected)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update name/company |
| PUT | /api/auth/change-password | Change password |

### Renewals (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/renewals | List renewals (search/filter/sort) |
| POST | /api/renewals | Create renewal |
| GET | /api/renewals/stats | Dashboard stats |
| POST | /api/renewals/import | Bulk CSV import |
| PUT | /api/renewals/{id} | Update renewal |
| DELETE | /api/renewals/{id} | Delete renewal |

### Categories (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/categories | List all categories |
| POST | /api/categories | Create custom category |
| DELETE | /api/categories/{name} | Delete custom category |

### Notifications (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/notifications | Get renewal alerts |

## Running Locally

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Scheduled Jobs

The `tracksy:send-reminders` command runs daily at 08:00 (configured in `routes/console.php`).
To test it manually: `php artisan tracksy:send-reminders`
