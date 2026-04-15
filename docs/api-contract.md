# CampusEvents API Contract

Base URL: `http://localhost:3001`

All responses use `Content-Type: application/json`.
All error responses return `{ "error": "message" }`.

---

## GET /api/events

List all events, optionally filtered by category.

### Query Parameters

| Param    | Type   | Required | Description                          |
|----------|--------|----------|--------------------------------------|
| category | string | No       | Filter by category (e.g. `Tech`, `Sports`) |

### Success Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Web Dev Workshop",
    "date": "2026-05-10",
    "category": "Tech",
    "created_at": "2026-04-15T00:00:00.000Z"
  }
]
```

Returns an empty array `[]` when no events match.

### Error Responses

| Status | Condition              | Body                                        |
|--------|------------------------|---------------------------------------------|
| 400    | Invalid category value | `{ "error": "Invalid category" }`           |

Valid categories: `Tech`, `Sports`.

### Examples

```bash
# List all events
curl http://localhost:3001/api/events

# Filter by category
curl http://localhost:3001/api/events?category=Tech
```

---

## GET /api/events/:id

Get a single event by ID.

### Path Parameters

| Param | Type    | Required | Description        |
|-------|---------|----------|--------------------|
| id    | integer | Yes      | The event ID       |

### Success Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "title": "Web Dev Workshop",
  "date": "2026-05-10",
  "category": "Tech",
  "created_at": "2026-04-15T00:00:00.000Z"
}
```

### Error Responses

| Status | Condition              | Body                                  |
|--------|------------------------|---------------------------------------|
| 400    | Non-integer ID         | `{ "error": "Invalid event ID" }`    |
| 404    | Event not found        | `{ "error": "Event not found" }`     |

### Examples

```bash
# Get event with ID 1
curl http://localhost:3001/api/events/1

# Non-existent event (returns 404)
curl http://localhost:3001/api/events/999
```

---

## POST /api/events

Create a new event.

### Request Body

| Field    | Type   | Required | Description                        |
|----------|--------|----------|------------------------------------|
| title    | string | Yes      | Event title (1-100 characters)     |
| date     | string | Yes      | Event date in `YYYY-MM-DD` format  |
| category | string | Yes      | Must be `Tech` or `Sports`         |

```json
{
  "title": "Intro to Docker",
  "date": "2026-06-01",
  "category": "Tech"
}
```

### Success Response

**Status:** `201 Created`

```json
{
  "id": 6,
  "title": "Intro to Docker",
  "date": "2026-06-01",
  "category": "Tech",
  "created_at": "2026-04-15T12:00:00.000Z"
}
```

### Error Responses

| Status | Condition                        | Body                                                  |
|--------|----------------------------------|-------------------------------------------------------|
| 400    | Missing required field           | `{ "error": "Title is required" }`                    |
| 400    | Title empty or too long          | `{ "error": "Title must be between 1 and 100 characters" }` |
| 400    | Invalid date format              | `{ "error": "Date must be in YYYY-MM-DD format" }`   |
| 400    | Invalid category                 | `{ "error": "Category must be Tech or Sports" }`     |

Validation order: title, date, category (first failing field wins).

### Examples

```bash
# Create a new event
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Intro to Docker", "date": "2026-06-01", "category": "Tech"}'

# Missing title (returns 400)
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-06-01", "category": "Tech"}'
```
