## Why

The README explicitly tracks event comments as a planned feature: "Events do not currently support user interaction (comments, likes)." Adding comments lets users ask questions, share excitement, and coordinate around events — turning passive event listings into a lightweight social layer. This is the natural next step given that registration and bookmarks already exist.

## What Changes

- Add a `comments` table to the SQLite database (flat, no threading)
- Add REST API endpoints for listing, creating, and deleting comments on an event
- Add a comments section UI to the event detail page
- Any logged-in user can post a comment; anyone (including anonymous visitors) can view comments
- Comments are plain text, max 500 characters
- Users can delete their own comments; admins can delete any comment
- No threading, no likes, no editing — intentionally minimal

## Capabilities

### New Capabilities
- `event-comments`: Flat text comments on events — create, list, delete with auth rules and character limit

### Modified Capabilities
<!-- None — this is a new, additive feature with no changes to existing specs -->

## Impact

- **Database**: New `comments` table with foreign keys to `events` and `users`
- **API**: New route file `server/routes/comments.js` mounted under `/api/events/:id/comments`
- **Frontend**: New `CommentSection` component rendered on the event detail page
- **Tests**: New test file `tests/comments.test.js` covering CRUD and auth scenarios
- **Dependencies**: None — uses existing Express + better-sqlite3 stack
