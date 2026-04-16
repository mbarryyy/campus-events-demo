## Context

CampusEvents currently supports three user-event interactions: registration, bookmarks, and notifications. All three follow the same pattern — a junction table with `user_id`/`event_id` foreign keys, a dedicated route file, and corresponding frontend components. Comments will be the fourth interaction, following the same conventions.

The app uses Express + better-sqlite3 on the backend, React 19 + Vite on the frontend, and JWT-based authentication with an admin role.

## Goals / Non-Goals

**Goals:**
- Allow authenticated users to post flat text comments on any event
- Allow anyone (including unauthenticated visitors) to read comments
- Allow users to delete their own comments; admins can delete any comment
- Keep the feature minimal and consistent with existing patterns

**Non-Goals:**
- Threaded/nested comments
- Comment editing
- Likes or reactions on comments
- Real-time updates (WebSocket/SSE)
- Rich text or markdown formatting
- Comment notifications (can be added later)

## Decisions

### 1. Flat table, no parent_id

**Decision**: Single `comments` table with no `parent_id` column.

**Rationale**: Threading adds recursive query complexity (CTEs or multiple queries), nested UI rendering, and UX decisions (collapse depth, sort order within threads). The proposal explicitly scopes this out. Adding `parent_id` later is a non-breaking migration.

**Alternative considered**: Adding a nullable `parent_id` now "just in case" — rejected because YAGNI, and it invites UI complexity creep.

### 2. Nested route under events

**Decision**: Mount comments at `/api/events/:id/comments` in a new `server/routes/comments.js` file, registered inside the events router or at the app level.

**Rationale**: Follows the existing pattern of `/api/events/:id/attendees`. Comments are a sub-resource of events. One file per resource matches the project conventions.

**Alternative considered**: Flat `/api/comments?eventId=X` — rejected because it breaks the RESTful nesting convention already established.

### 3. Pagination on GET, newest-first

**Decision**: GET endpoint returns comments paginated (default 20 per page), ordered by `created_at DESC` (newest first).

**Rationale**: Events could accumulate many comments over time. Pagination prevents unbounded response sizes. Newest-first matches user expectations for comment feeds.

### 4. Auth rules: authenticate to write, public to read

**Decision**: `POST` and `DELETE` require authentication (`authenticate` middleware). `GET` is public (no auth required).

**Rationale**: Matches the existing pattern where event listings are public but registration requires login. Keeps the barrier to viewing low while preventing anonymous spam.

### 5. Delete own or admin — no soft delete

**Decision**: Users can hard-delete their own comments. Admins can hard-delete any comment. No soft delete.

**Rationale**: This is a simple campus app, not a moderation platform. Soft delete adds a `deleted_at` column, filtering logic, and admin restore UI — all unnecessary complexity for this scope.

### 6. Frontend: CommentSection component on EventModal

**Decision**: Add a `CommentSection.jsx` component rendered within the existing `EventModal` component, below the event details.

**Rationale**: Comments are contextual to a specific event. The event detail view (modal) is where users already go to see full event info, register, and bookmark. Adding comments there keeps the interaction flow cohesive.

## Risks / Trade-offs

- **[Spam]** → No rate limiting in this iteration. Acceptable for a demo app with authenticated-only posting. Can add rate limiting later if needed.
- **[Unbounded comment length]** → Mitigated by the 500-character limit enforced server-side.
- **[No edit capability]** → Users must delete and re-post to fix typos. Acceptable trade-off for simplicity; editing adds optimistic update complexity and audit concerns.
- **[No notifications on new comments]** → The notification system exists but wiring it for comments is out of scope. Could be a follow-up change.
