# CampusEvents — Full Design Document

## Overview

CampusEvents is a campus event management platform where students can discover, search, and register for events. Admins can manage events and users. The app intentionally does **not** support comments on events — this gap will be filled by an OpenSpec workflow demo.

---

## Database Schema

### users

| Column        | Type    | Constraints                          |
|---------------|---------|--------------------------------------|
| id            | INTEGER | PRIMARY KEY AUTOINCREMENT            |
| username      | TEXT    | UNIQUE NOT NULL, 3-30 chars          |
| email         | TEXT    | UNIQUE NOT NULL, valid email format  |
| password_hash | TEXT    | NOT NULL (bcrypt)                    |
| display_name  | TEXT    | NOT NULL                             |
| role          | TEXT    | NOT NULL DEFAULT 'user' ('user'/'admin') |
| created_at    | TEXT    | DEFAULT datetime('now')              |

### events

| Column      | Type    | Constraints                          |
|-------------|---------|--------------------------------------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT            |
| title       | TEXT    | NOT NULL, 1-100 chars                |
| description | TEXT    | nullable, max 1000 chars             |
| date        | TEXT    | NOT NULL, YYYY-MM-DD                 |
| time        | TEXT    | NOT NULL, HH:MM (24h)               |
| location    | TEXT    | NOT NULL                             |
| category    | TEXT    | NOT NULL (Tech/Sports/Academic/Social/Music/Career) |
| capacity    | INTEGER | NOT NULL, min 1                      |
| image_url   | TEXT    | nullable, gradient fallback in UI    |
| created_by  | INTEGER | REFERENCES users(id)                 |
| created_at  | TEXT    | DEFAULT datetime('now')              |

### registrations

| Column        | Type    | Constraints                        |
|---------------|---------|-------------------------------------|
| id            | INTEGER | PRIMARY KEY AUTOINCREMENT           |
| user_id       | INTEGER | REFERENCES users(id) ON DELETE CASCADE |
| event_id      | INTEGER | REFERENCES events(id) ON DELETE CASCADE |
| registered_at | TEXT    | DEFAULT datetime('now')             |
| UNIQUE        |         | (user_id, event_id)                 |

---

## Seed Data

### Admin Account (hardcoded, auto-seeded)

```
username:     admin
email:        admin@campusevents.ac.nz
password:     admin123
display_name: System Admin
role:         admin
```

### Seed Events (20 events, 6 categories)

| # | Title | Category | Date | Time | Location | Capacity |
|---|-------|----------|------|------|----------|----------|
| 1 | Web Dev Workshop | Tech | 2026-05-10 | 14:00 | Engineering Building Room 401 | 40 |
| 2 | AI Hackathon | Tech | 2026-05-15 | 09:00 | Science Centre Atrium | 100 |
| 3 | Campus Soccer Tournament | Sports | 2026-05-12 | 10:00 | Main Sports Field | 200 |
| 4 | Basketball Finals | Sports | 2026-05-20 | 18:00 | Recreation Centre Court A | 150 |
| 5 | Open Source Meetup | Tech | 2026-05-22 | 17:30 | Library Seminar Room 2 | 30 |
| 6 | Study Group Meetup | Academic | 2026-06-01 | 10:00 | Kate Edger Room 3B | 25 |
| 7 | Cultural Night | Social | 2026-06-05 | 18:00 | Quad Lawn Stage | 300 |
| 8 | Debate Competition | Academic | 2026-06-08 | 13:00 | Arts Building Lecture Hall | 60 |
| 9 | Yoga in the Park | Sports | 2026-05-18 | 07:30 | Albert Park Fountain Area | 40 |
| 10 | Startup Pitch Day | Career | 2026-06-10 | 09:00 | Owen Glenn Building WG404 | 80 |
| 11 | Photography Walk | Social | 2026-05-25 | 15:00 | Clock Tower Meeting Point | 20 |
| 12 | Charity Fun Run | Sports | 2026-06-15 | 08:00 | Domain Loop Track | 500 |
| 13 | Machine Learning Workshop | Tech | 2026-06-12 | 14:00 | Engineering Building Room 302 | 35 |
| 14 | Career Fair 2026 | Career | 2026-06-20 | 10:00 | Recreation Centre Main Hall | 400 |
| 15 | Jazz Night | Music | 2026-05-28 | 19:30 | Shadows Bar Stage | 80 |
| 16 | Resume Writing Clinic | Career | 2026-06-02 | 11:00 | Student Commons Room 4 | 30 |
| 17 | Spring Dance | Social | 2026-06-22 | 20:00 | Old Government House Ballroom | 200 |
| 18 | Research Symposium | Academic | 2026-06-18 | 09:00 | Conference Centre Level 1 | 120 |
| 19 | Acoustic Open Mic | Music | 2026-06-08 | 18:30 | Quad Lawn Stage | 100 |
| 20 | Swimming Gala | Sports | 2026-06-25 | 14:00 | Aquatic Centre | 150 |

---

## API Design

### Auth Routes — `/api/auth`

#### POST /api/auth/register

```json
// Request
{ "username": "alice", "email": "alice@uni.ac.nz", "password": "password123", "displayName": "Alice Wang" }

// Success 201
{ "user": { "id": 2, "username": "alice", "email": "alice@uni.ac.nz", "displayName": "Alice Wang", "role": "user" }, "token": "jwt..." }

// Errors
400 { "error": "Username is required" }
400 { "error": "Email is already registered" }
400 { "error": "Password must be at least 6 characters" }
```

#### POST /api/auth/login

```json
// Request
{ "email": "alice@uni.ac.nz", "password": "password123" }

// Success 200
{ "user": { "id": 2, "username": "alice", "email": "alice@uni.ac.nz", "displayName": "Alice Wang", "role": "user" }, "token": "jwt..." }

// Errors
400 { "error": "Email and password are required" }
401 { "error": "Invalid email or password" }
```

#### GET /api/auth/me

```
Headers: Authorization: Bearer <token>

// Success 200
{ "id": 2, "username": "alice", "email": "alice@uni.ac.nz", "displayName": "Alice Wang", "role": "user", "createdAt": "2026-04-15T00:00:00.000Z" }

// Errors
401 { "error": "Authentication required" }
```

---

### Event Routes — `/api/events`

#### GET /api/events

```
Query params:
  ?category=Tech          — filter by category
  ?search=workshop        — search title + description (LIKE)
  ?page=1&limit=12        — pagination (default page=1, limit=12)
  ?sort=date_asc          — sort: date_asc (default), date_desc, newest, oldest

// Success 200
{
  "events": [ { "id": 1, "title": "...", "description": "...", "date": "2026-05-10", "time": "14:00", "location": "...", "category": "Tech", "capacity": 40, "registrationCount": 12, "createdBy": { "id": 1, "displayName": "System Admin" }, "createdAt": "..." } ],
  "pagination": { "page": 1, "limit": 12, "total": 20, "totalPages": 2 }
}
```

#### GET /api/events/:id

```
// Success 200 — includes isRegistered if authenticated
{ "id": 1, "title": "...", ..., "registrationCount": 12, "spotsLeft": 28, "isRegistered": false }

// Errors
404 { "error": "Event not found" }
```

#### POST /api/events (admin only)

```
Headers: Authorization: Bearer <admin-token>

// Request
{ "title": "New Event", "description": "...", "date": "2026-07-01", "time": "14:00", "location": "Room 101", "category": "Tech", "capacity": 50 }

// Success 201
{ "id": 21, "title": "New Event", ... }

// Errors
401 { "error": "Authentication required" }
403 { "error": "Admin access required" }
400 { "error": "Title is required" }
```

#### PUT /api/events/:id (admin only)

```
Headers: Authorization: Bearer <admin-token>

// Request (partial update)
{ "title": "Updated Title", "capacity": 60 }

// Success 200
{ "id": 1, "title": "Updated Title", ... }

// Errors
403 { "error": "Admin access required" }
404 { "error": "Event not found" }
```

#### DELETE /api/events/:id (admin only)

```
// Success 200
{ "message": "Event deleted successfully" }

// Errors
403 { "error": "Admin access required" }
404 { "error": "Event not found" }
```

---

### Registration Routes — `/api/events/:id/register`

#### POST /api/events/:id/register (authenticated)

```
Headers: Authorization: Bearer <token>

// Success 201
{ "message": "Successfully registered", "registration": { "id": 1, "eventId": 1, "userId": 2, "registeredAt": "..." } }

// Errors
401 { "error": "Authentication required" }
404 { "error": "Event not found" }
409 { "error": "Already registered for this event" }
409 { "error": "Event is at full capacity" }
```

#### DELETE /api/events/:id/register (authenticated)

```
// Success 200
{ "message": "Registration cancelled" }

// Errors
404 { "error": "Not registered for this event" }
```

---

### Admin Routes — `/api/admin` (admin only)

#### GET /api/admin/stats

```json
{
  "totalUsers": 45,
  "totalEvents": 20,
  "totalRegistrations": 128,
  "recentRegistrations": [ { "id": 1, "user": { "displayName": "Alice" }, "event": { "title": "AI Hackathon" }, "registeredAt": "..." } ],
  "eventsByCategory": { "Tech": 4, "Sports": 5, "Academic": 3, "Social": 3, "Music": 2, "Career": 3 },
  "upcomingEvents": 15
}
```

#### GET /api/admin/users

```
Query: ?page=1&limit=20&search=alice

// Success 200
{
  "users": [ { "id": 2, "username": "alice", "email": "alice@uni.ac.nz", "displayName": "Alice Wang", "role": "user", "registrationCount": 5, "createdAt": "..." } ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

#### GET /api/admin/events/:id/attendees

```json
{
  "event": { "id": 1, "title": "Web Dev Workshop" },
  "attendees": [ { "id": 2, "username": "alice", "displayName": "Alice Wang", "registeredAt": "..." } ],
  "total": 12
}
```

---

## Frontend Pages & Components

### Pages

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Home | Public | Event grid + search + category filter + pagination |
| `/login` | Login | Public | Email + password form, link to register |
| `/register` | Register | Public | Username + email + password + display name form |
| `/events/:id` | Event Detail | Public | Full event page with register button, attendee count, spots left |
| `/my-events` | My Events | Auth | User's registered events list |
| `/admin` | Admin Dashboard | Admin | Stats cards + recent activity + charts |
| `/admin/events` | Manage Events | Admin | Event table with create/edit/delete |
| `/admin/events/new` | Create Event | Admin | Event creation form |
| `/admin/events/:id/edit` | Edit Event | Admin | Pre-filled edit form |
| `/admin/users` | Manage Users | Admin | User table with search |

### Component Tree

```
App
├── Header (logo, nav links, search, auth buttons / user menu)
├── Routes
│   ├── HomePage
│   │   ├── CategoryFilter
│   │   ├── EventGrid
│   │   │   ├── EventCard (x N)
│   │   │   └── EmptyState
│   │   └── Pagination
│   ├── EventDetailPage
│   │   ├── EventHero (title, image/gradient, category badge)
│   │   ├── EventInfo (date, time, location, capacity bar)
│   │   ├── RegisterButton / UnregisterButton
│   │   └── CommentsSection (placeholder: "Comments coming soon")
│   ├── LoginPage
│   │   └── LoginForm
│   ├── RegisterPage
│   │   └── RegisterForm
│   ├── MyEventsPage
│   │   └── EventCard (registered events)
│   ├── AdminDashboard
│   │   ├── StatCard (x4: users, events, registrations, upcoming)
│   │   ├── RecentActivityList
│   │   └── CategoryChart (simple bar chart with CSS)
│   ├── AdminEventsPage
│   │   ├── EventTable
│   │   └── CreateEventModal / EditEventModal
│   └── AdminUsersPage
│       └── UserTable
├── Toast (notification system)
└── Footer
```

### Shared Components

| Component | Purpose |
|-----------|---------|
| `Header` | Sticky nav with logo, links (Home, My Events), search, auth |
| `ProtectedRoute` | Redirects to /login if not authenticated |
| `AdminRoute` | Redirects to / if not admin |
| `EventCard` | Card for event grid — image/gradient, title, date, location, category badge, spots left |
| `Pagination` | Page numbers + prev/next buttons |
| `StatCard` | Dashboard stat with icon, number, label, trend |
| `Toast` | Success/error/info notifications, auto-dismiss |
| `LoadingSpinner` | Centered spinner for async states |
| `Modal` | Reusable modal wrapper (backdrop + card + close) |
| `CapacityBar` | Visual progress bar showing spots taken vs capacity |

---

## UI Design System

### Colors

```css
--primary:       #6366f1  (indigo)
--primary-dark:  #4f46e5
--primary-light: #a5b4fc

--cat-tech:      #3b82f6  (blue)
--cat-sports:    #10b981  (emerald)
--cat-academic:  #8b5cf6  (purple)
--cat-social:    #ec4899  (pink)
--cat-music:     #f59e0b  (amber)
--cat-career:    #06b6d4  (cyan)

--success:       #10b981
--warning:       #f59e0b
--error:         #ef4444
--info:          #3b82f6

--bg:            #f8fafc
--bg-card:       #ffffff
--text:          #1e293b
--text-muted:    #64748b
--border:        #e2e8f0
```

### Typography

- Font: Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- Monospace: Fira Code (code blocks, stats)

### Card Styles

- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: translateY(-2px) + shadow increase
- Category color bar: 4px top border

### Event Card Layout

```
┌──────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← gradient bg by category
│ ▓                          ▓ │
│ ▓   📅 May 10, 2026       ▓ │
│ ▓   ⏰ 2:00 PM            ▓ │
│ ▓                    [Tech]▓ │ ← category badge
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                              │
│ Web Dev Workshop             │ ← title
│ Learn modern web dev with... │ ← description (2-line clamp)
│                              │
│ 📍 Engineering Bldg Rm 401  │ ← location
│ ████████░░░░  28/40 spots   │ ← capacity bar
└──────────────────────────────┘
```

### Admin Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Admin Dashboard                            │
├──────────┬──────────┬──────────┬────────────┤
│  👥 45   │  📅 20   │  🎫 128  │  📆 15    │
│  Users   │  Events  │  Reg's   │  Upcoming  │
├──────────┴──────────┴──────────┴────────────┤
│                                             │
│  Recent Registrations        Category Chart │
│  ┌─────────────────────┐    ┌─────────────┐│
│  │ Alice → AI Hackathon│    │ Tech    ████││
│  │ Bob → Soccer Tourney│    │ Sports  █████││
│  │ Carol → Jazz Night  │    │ Academic ███││
│  └─────────────────────┘    │ Social  ███ ││
│                              │ Music   ██  ││
│                              │ Career  ███ ││
│                              └─────────────┘│
└─────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Auth + Database
- bcrypt password hashing
- JWT token generation/verification
- Auth middleware (authenticate, requireAdmin)
- /api/auth routes (register, login, me)
- Updated DB schema (users table, updated events table with time/location/capacity/created_by)
- Updated seed data (20 events + admin account)
- Frontend: Login page, Register page, auth context, protected routes

### Phase 2: Event Management
- Admin CRUD: POST/PUT/DELETE /api/events
- Event detail page (not modal) with full info
- Capacity bar component
- Registration: POST/DELETE /api/events/:id/register
- My Events page for logged-in users
- Event card redesign with location, time, capacity bar
- Pagination on event list

### Phase 3: Admin Dashboard
- GET /api/admin/stats
- GET /api/admin/users (with pagination + search)
- GET /api/admin/events/:id/attendees
- Admin dashboard page with stat cards, recent activity, category chart
- Admin events page with table + create/edit/delete
- Admin users page with table + search

### Phase 4: UX Polish
- Toast notification system
- Loading spinners / skeleton states
- Error boundaries
- Form validation feedback (inline errors)
- Responsive design (mobile hamburger menu)
- Footer
- 404 page
- Smooth page transitions

---

## Known Limitation (for OpenSpec demo)

> "Events do not currently support user comments or discussion.
> This is tracked as a planned feature and will be implemented
> using the OpenSpec spec-driven workflow."

This gap is intentional and will be filled by running:
1. `openspec init`
2. `/opsx:propose add-event-comments`
3. `/opsx:apply`
4. `/opsx:archive`

The comments feature will add:
- `comments` table (user_id, event_id, body, created_at)
- GET /api/events/:id/comments
- POST /api/events/:id/comments (authenticated)
- CommentList + CommentForm frontend components
- Integration into EventDetailPage

---

## Security Considerations

- Passwords: bcrypt with salt rounds = 10
- JWT: HS256, 24h expiry, secret from env var or fallback
- Input validation: all user inputs sanitized and validated
- SQL injection: prevented by parameterized queries (better-sqlite3 default)
- CORS: configured for development (localhost)
- Rate limiting: not implemented (out of scope for demo)
- XSS: React auto-escapes, no dangerouslySetInnerHTML

---

## Tech Stack

- **Backend:** Express.js, better-sqlite3, bcryptjs, jsonwebtoken, cors
- **Frontend:** React 19, Vite, React Router v7
- **Testing:** Vitest, Supertest
- **Styling:** CSS (custom properties, no framework)
