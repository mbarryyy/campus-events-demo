## ADDED Requirements

### Requirement: List comments on an event
The system SHALL return a paginated list of comments for a given event, ordered by newest first. Each comment SHALL include the comment ID, body text, author display name, author ID, and creation timestamp. The endpoint SHALL be publicly accessible without authentication.

#### Scenario: List comments on an event with comments
- **WHEN** a GET request is made to `/api/events/:id/comments`
- **THEN** the system returns 200 with a JSON object containing `comments` array and `pagination` object (page, limit, total, totalPages)

#### Scenario: List comments with pagination
- **WHEN** a GET request is made to `/api/events/:id/comments?page=2&limit=5`
- **THEN** the system returns the second page of 5 comments, with correct pagination metadata

#### Scenario: List comments on an event with no comments
- **WHEN** a GET request is made to `/api/events/:id/comments` for an event with zero comments
- **THEN** the system returns 200 with an empty `comments` array and `total: 0`

#### Scenario: List comments on a non-existent event
- **WHEN** a GET request is made to `/api/events/99999/comments`
- **THEN** the system returns 404 with `{ error: "Event not found" }`

### Requirement: Create a comment on an event
The system SHALL allow authenticated users to create a plain-text comment on any existing event. The comment body MUST be between 1 and 500 characters after trimming whitespace.

#### Scenario: Authenticated user posts a valid comment
- **WHEN** an authenticated user sends a POST to `/api/events/:id/comments` with `{ "body": "Looks great!" }`
- **THEN** the system returns 201 with the created comment object including id, body, author info, and createdAt

#### Scenario: Unauthenticated user attempts to post a comment
- **WHEN** an unauthenticated request is sent to POST `/api/events/:id/comments`
- **THEN** the system returns 401 with `{ error: "..." }`

#### Scenario: Comment body is empty or whitespace-only
- **WHEN** an authenticated user sends a POST with `{ "body": "   " }`
- **THEN** the system returns 400 with `{ error: "Comment body is required and must be 1-500 characters" }`

#### Scenario: Comment body exceeds 500 characters
- **WHEN** an authenticated user sends a POST with a body longer than 500 characters
- **THEN** the system returns 400 with `{ error: "Comment body is required and must be 1-500 characters" }`

#### Scenario: Post comment on a non-existent event
- **WHEN** an authenticated user sends a POST to `/api/events/99999/comments`
- **THEN** the system returns 404 with `{ error: "Event not found" }`

### Requirement: Delete a comment
The system SHALL allow a user to delete their own comment. Admin users SHALL be able to delete any comment.

#### Scenario: User deletes their own comment
- **WHEN** an authenticated user sends a DELETE to `/api/events/:id/comments/:commentId` for a comment they authored
- **THEN** the system returns 200 with `{ message: "Comment deleted successfully" }`

#### Scenario: User attempts to delete another user's comment
- **WHEN** a non-admin authenticated user sends a DELETE for a comment authored by a different user
- **THEN** the system returns 403 with `{ error: "You can only delete your own comments" }`

#### Scenario: Admin deletes any comment
- **WHEN** an admin user sends a DELETE to `/api/events/:id/comments/:commentId`
- **THEN** the system returns 200 with `{ message: "Comment deleted successfully" }`

#### Scenario: Delete a non-existent comment
- **WHEN** an authenticated user sends a DELETE for a comment ID that does not exist
- **THEN** the system returns 404 with `{ error: "Comment not found" }`

### Requirement: Comment data model
The system SHALL store comments in a `comments` table with integer autoincrement primary key, foreign keys to `events` and `users` with CASCADE delete, a non-empty text body, and an auto-generated creation timestamp.

#### Scenario: Event is deleted
- **WHEN** an event with comments is deleted
- **THEN** all comments associated with that event are also deleted (CASCADE)

#### Scenario: User account is deleted
- **WHEN** a user who has posted comments is deleted
- **THEN** all comments authored by that user are also deleted (CASCADE)
