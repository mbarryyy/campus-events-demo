# CampusEvents Component Specifications

## Component Tree

```
App
├── CategoryFilter
└── EventList
    ├── EventCard (one per event)
    └── EmptyState (when no events match)
```

---

## App

**File:** `client/src/App.jsx`

Root component. Manages application state and composes the page layout.

### State

| Name             | Type     | Initial   | Description                       |
|------------------|----------|-----------|-----------------------------------|
| events           | array    | `[]`      | List of event objects             |
| selectedCategory | string   | `""`      | Active category filter (`""` = all) |

### Behavior

1. On mount, fetch events from `GET /api/events`.
2. When `selectedCategory` changes, re-fetch with `?category=<value>` (or fetch all if empty).
3. Pass `events` to `EventList`; pass filter state to `CategoryFilter`.

### Data Flow

- Calls `api.getEvents(category?)` from `services/api.js`.
- Derives `categories` list: hardcoded `["Tech", "Sports"]`.

---

## CategoryFilter

**File:** `client/src/components/CategoryFilter.jsx`

Renders filter buttons for each category plus an "All" option.

### Props

| Prop       | Type       | Description                                  |
|------------|------------|----------------------------------------------|
| categories | string[]   | Available categories, e.g. `["Tech", "Sports"]` |
| selected   | string     | Currently selected category (`""` = all)     |
| onChange   | function   | Callback `(category: string) => void`        |

### Behavior

- Renders one button per category, plus an "All" button.
- The active button is visually highlighted (bold or distinct background).
- Clicking a button calls `onChange(category)` (or `onChange("")` for "All").

---

## EventList

**File:** `client/src/components/EventList.jsx`

Renders a list of EventCard components, or EmptyState if the list is empty.

### Props

| Prop   | Type    | Description              |
|--------|---------|--------------------------|
| events | array   | Array of event objects   |

### Behavior

- If `events.length === 0`, render `<EmptyState />`.
- Otherwise, render one `<EventCard />` per event.
- Each `EventCard` must have `key={event.id}`.

---

## EventCard

**File:** `client/src/components/EventCard.jsx`

Displays a single event's details.

### Props

| Prop  | Type   | Description                                        |
|-------|--------|----------------------------------------------------|
| event | object | `{ id, title, date, category, created_at }` |

### Rendered Content

- **Title:** `event.title`
- **Date:** `event.date` (displayed as-is, `YYYY-MM-DD`)
- **Category:** `event.category` (badge or label)

---

## EmptyState

**File:** `client/src/components/EmptyState.jsx`

Static message shown when no events match the current filter.

### Props

None.

### Rendered Content

Displays: "No events found."

---

## services/api.js

**File:** `client/src/services/api.js`

API client module. All functions return Promises.

### Functions

| Function               | Method | Endpoint                          | Returns          |
|------------------------|--------|-----------------------------------|------------------|
| `getEvents(category?)` | GET    | `/api/events` or `?category=...`  | `Promise<array>` |
| `getEvent(id)`         | GET    | `/api/events/:id`                 | `Promise<object>`|
| `createEvent(data)`    | POST   | `/api/events`                     | `Promise<object>`|

Uses `fetch()` with the Vite dev proxy (relative URLs like `/api/events`).
Throws on non-OK responses with the error message from the JSON body.
