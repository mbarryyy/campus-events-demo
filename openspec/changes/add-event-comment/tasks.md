## 1. Database

- [ ] 1.1 Add `comments` table to `server/db.js` with columns: id (INTEGER PK AUTOINCREMENT), event_id (FK events ON DELETE CASCADE), user_id (FK users ON DELETE CASCADE), body (TEXT NOT NULL), created_at (TEXT DEFAULT datetime('now'))

## 2. Backend API

- [ ] 2.1 Create `server/routes/comments.js` with a `createCommentsRouter(db)` factory function following the existing router pattern
- [ ] 2.2 Implement GET `/api/events/:id/comments` — public, paginated (default 20/page), newest-first, returns `{ comments, pagination }`
- [ ] 2.3 Implement POST `/api/events/:id/comments` — authenticated, validates body (1-500 chars after trim), returns 201 with created comment
- [ ] 2.4 Implement DELETE `/api/events/:id/comments/:commentId` — authenticated, owner or admin can delete, returns `{ message }` on success
- [ ] 2.5 Register the comments router in `server/index.js`

## 3. Frontend

- [ ] 3.1 Add `getComments(eventId, page)` and `createComment(eventId, body)` and `deleteComment(eventId, commentId)` functions to `client/src/services/api.js`
- [ ] 3.2 Create `client/src/components/CommentSection.jsx` — displays paginated comment list, comment form (if logged in), and delete button (for own comments or admin)
- [ ] 3.3 Integrate `CommentSection` into the event detail view (`EventModal.jsx`)

## 4. Tests

- [ ] 4.1 Create `tests/comments.test.js` with Supertest covering: list comments (empty, populated, pagination, 404 event), create comment (success, unauthenticated, empty body, over 500 chars, 404 event), delete comment (own, other user's, admin, 404 comment)
