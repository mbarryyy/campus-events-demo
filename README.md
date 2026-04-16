# CampusEvents

A brownfield campus event management platform built as a demo for an OpenSpec tech tutorial (CS732). Students can discover, search, filter, and register for campus events. Admins can manage events and users through a dedicated dashboard.

## Screenshots

<!-- TODO: Add screenshots -->

## Features

- User registration and login with JWT authentication
- User profile management (update display name, email, change password)
- User dashboard with registration stats and upcoming events
- Browse events with search, category filter, and pagination
- Advanced filtering: date range, time of day, available spots
- Event detail pages with registration and capacity tracking
- Register/unregister for events with real-time spot tracking
- Bookmark/favorite events for quick access
- In-app notification system (registration confirmations, event updates)
- Public attendee list on event pages (social proof)
- Admin dashboard with stats, recent activity, and category breakdown
- Admin event management (create, edit, delete)
- Admin user management with search
- 20 seed events across 6 categories (Tech, Sports, Academic, Social, Music, Career)
- Responsive modern UI with category-colored cards

## Tech Stack

- **Backend:** Express.js + better-sqlite3
- **Frontend:** React 19 + Vite
- **Auth:** bcryptjs + jsonwebtoken (JWT)
- **Testing:** Vitest + Supertest
- **Language:** JavaScript

## Prerequisites

- Node.js 18+
- npm

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd demo-app

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Start both server and client
npm run dev
```

The server runs on `http://localhost:3001` and the client on `http://localhost:5173`.

## Available Scripts

| Script           | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Start both server and client             |
| `npm run server` | Start the Express server (port 3001)     |
| `npm run client` | Start the Vite dev server                |
| `npm test`       | Run tests with Vitest                    |

## API Reference

Full API documentation is available in [docs/api-contract.md](docs/api-contract.md).

### Endpoints Overview

| Method | Endpoint                          | Auth     | Description                    |
|--------|-----------------------------------|----------|--------------------------------|
| POST   | `/api/auth/register`              | Public   | Register a new user            |
| POST   | `/api/auth/login`                 | Public   | Log in                         |
| GET    | `/api/auth/me`                    | Required | Get current user               |
| PUT    | `/api/auth/profile`               | Required | Update profile (name, email)   |
| PUT    | `/api/auth/password`              | Required | Change password                |
| GET    | `/api/auth/activity`              | Required | Recent registration history    |
| GET    | `/api/auth/dashboard`             | Required | User dashboard stats           |
| GET    | `/api/events`                     | Public   | List events (paginated, filterable) |
| GET    | `/api/events/:id`                 | Public   | Get event detail               |
| GET    | `/api/events/:id/attendees`       | Public   | Public attendee list           |
| POST   | `/api/events`                     | Admin    | Create event                   |
| PUT    | `/api/events/:id`                 | Admin    | Update event                   |
| DELETE | `/api/events/:id`                 | Admin    | Delete event                   |
| POST   | `/api/events/:id/register`        | Required | Register for event             |
| DELETE | `/api/events/:id/register`        | Required | Cancel registration            |
| POST   | `/api/events/:id/bookmark`        | Required | Bookmark event                 |
| DELETE | `/api/events/:id/bookmark`        | Required | Remove bookmark                |
| GET    | `/api/bookmarks`                  | Required | List bookmarked events         |
| GET    | `/api/notifications`              | Required | List notifications (paginated) |
| GET    | `/api/notifications/unread-count` | Required | Unread notification count      |
| PUT    | `/api/notifications/read-all`     | Required | Mark all as read               |
| PUT    | `/api/notifications/:id/read`     | Required | Mark single as read            |
| GET    | `/api/admin/stats`                | Admin    | Dashboard stats                |
| GET    | `/api/admin/users`                | Admin    | List users (paginated)         |
| GET    | `/api/admin/events/:id/attendees` | Admin    | Full attendee list             |

### Event List Query Parameters

| Param      | Example                  | Description                          |
|------------|--------------------------|--------------------------------------|
| `category` | `?category=Tech`         | Filter by category                   |
| `search`   | `?search=workshop`       | Search title and description         |
| `page`     | `?page=2`                | Page number (default: 1)             |
| `limit`    | `?limit=6`               | Items per page (default: 12)         |
| `sort`     | `?sort=date_desc`        | Sort: date_asc, date_desc, newest, oldest |
| `dateFrom` | `?dateFrom=2026-05-15`   | Events on or after date              |
| `dateTo`   | `?dateTo=2026-06-01`     | Events on or before date             |
| `hasSpots` | `?hasSpots=true`         | Only events with available spots     |
| `timeOfDay`| `?timeOfDay=morning`     | morning, afternoon, or evening       |

## Project Structure

```
demo-app/
├── server/
│   ├── index.js                    # Express app entry + createApp(db)
│   ├── db.js                       # SQLite init + seed (20 events + admin)
│   ├── routes/
│   │   ├── auth.js                 # Auth + profile + dashboard routes
│   │   ├── events.js               # Event CRUD + list + public attendees
│   │   ├── registrations.js        # Event registration/cancellation
│   │   ├── bookmarks.js            # Bookmark/favorite events
│   │   ├── notifications.js        # In-app notifications
│   │   └── admin.js                # Admin stats, users, attendees
│   └── middleware/
│       ├── auth.js                 # JWT authenticate + optionalAuth
│       ├── requireAdmin.js         # Admin role check
│       ├── validate.js             # Input validation
│       └── errorHandler.js         # Global error handler
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/             # React components
│   │   ├── services/api.js         # API client
│   │   └── utils/                  # Utilities
│   └── vite.config.js              # Proxy to localhost:3001
├── tests/
│   ├── setup.js                    # Test DB fixture + helpers
│   ├── auth.test.js                # Auth route tests (8 tests)
│   ├── events.test.js              # Event route tests (12 tests)
│   ├── registrations.test.js       # Registration tests (6 tests)
│   ├── admin.test.js               # Admin route tests (6 tests)
│   ├── profile.test.js             # Profile + password tests (9 tests)
│   ├── bookmarks.test.js           # Bookmark tests (7 tests)
│   ├── notifications.test.js       # Notification tests (7 tests)
│   ├── filtering.test.js           # Advanced filter tests (6 tests)
│   └── dashboard.test.js           # Dashboard + attendees tests (6 tests)
├── docs/
│   ├── api-contract.md             # API contract
│   ├── DESIGN.md                   # Full design document
│   └── db-schema.sql               # DB schema
├── package.json
├── vitest.config.js
└── README.md
```

## Default Admin Credentials

```
Email:    admin@campusevents.ac.nz
Password: admin123
```

## Testing

Run the full test suite:

```bash
npm test
```

The test suite includes 67 tests across 9 files covering auth, events, registrations, admin, profile, bookmarks, notifications, filtering, and dashboard endpoints. Tests use an in-memory SQLite database and are fully isolated.

## Future Work

The following features are planned for upcoming iterations:

- [ ] Event comments — allow users to discuss events
- [ ] Event image upload — custom cover images
- [ ] Email notifications — registration and update confirmations
- [ ] Comment moderation — admin review and removal

## License

ISC
