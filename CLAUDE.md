# CampusEvents Demo App

## Purpose

Brownfield demo app for an OpenSpec tech tutorial (CS732).
Intentionally simple — the goal is to showcase OpenSpec's workflow,
not to build a production app.

## Tech Stack

- **Backend:** Express.js + better-sqlite3 (NOT MongoDB, NOT Prisma)
- **Frontend:** React 19 + Vite
- **Testing:** Vitest + Supertest
- **Language:** JavaScript (NO TypeScript for simplicity)

## Project Structure

```
demo-app/
├── server/
│   ├── index.js              # Express app entry
│   ├── db.js                 # SQLite init + seed
│   ├── routes/events.js      # Event routes
│   └── middleware/validate.js # Shared validation
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/       # EventList, EventCard, CategoryFilter, EmptyState
│   │   └── services/api.js   # API calls
│   └── vite.config.js        # proxy to localhost:3001
├── tests/
│   ├── events.test.js        # Baseline route tests
│   └── setup.js              # Test DB fixture
├── docs/
│   ├── api-contract.md       # API contract (architect output)
│   ├── db-schema.sql         # DB schema (architect output)
│   └── components.md         # Component specs (architect output)
├── package.json
├── vitest.config.js
└── README.md
```

## Conventions (ALL agents MUST follow)

### IDs
- Integer autoincrement — **NOT** UUID

### Error Responses
- Always return `{ error: "message" }` — consistent shape everywhere

### Validation
- Reuse `server/middleware/validate.js` for ALL routes
- Return 400 with `{ error: "..." }` on invalid input

### Routes
- One file per resource in `server/routes/`
- RESTful naming: `/api/events`, `/api/events/:id`
- Server runs on port **3001**

### Tests
- File naming: `tests/<resource>.test.js`
- Pattern: `describe` / `it` + Supertest
- Each `it()` should map to a GIVEN/WHEN/THEN scenario

### Frontend
- Functional components + hooks only — NO class components
- File naming: PascalCase for components (`EventCard.jsx`)
- camelCase for services/utilities (`api.js`)
- Styling: simple CSS modules or inline styles — no Tailwind

### Git Commits
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Examples: `feat: add events API routes`, `test: add baseline event tests`

## File Ownership

| Agent      | Owns                                      |
|------------|-------------------------------------------|
| architect  | `docs/**`, `CLAUDE.md`                    |
| developer  | `server/**`, `client/**`, `package.json`  |
| tester     | `tests/**`, `vitest.config.js`, `README.md` |

**DO NOT edit files outside your ownership.**

## Known Limitation (intentional)

The README must include this line:

> "Events do not currently support user interaction (comments, likes).
> Tracked as a planned feature."

This is the gap that OpenSpec will fill after the baseline is complete.

## Seed Data

5 events across 2 categories:

| title                     | category | date       |
|---------------------------|----------|------------|
| Web Dev Workshop          | Tech     | 2026-05-10 |
| AI Hackathon              | Tech     | 2026-05-15 |
| Campus Soccer Tournament  | Sports   | 2026-05-12 |
| Basketball Finals         | Sports   | 2026-05-20 |
| Open Source Meetup         | Tech     | 2026-05-22 |
