# Edge Cases Coverage Report

## Authentication & Account Management

### POST Register with already-used email (case-insensitive)
   - Email normalized to lowercase in auth/service.py create_user()
   - IntegrityError handling added for race condition

### POST Username race condition on signup
   - IntegrityError handling added in auth/service.py create_user()
   - Returns 409 on duplicate username/email

---

## Posts & Content

### DELETE Delete a post that has been shared/reposted
   - Post status field added (active/deleted) in post/models.py
   - Soft delete pattern implemented

---

## Likes & Reactions

### POST Double like race condition
   - Unique constraint on (user_id, post_id) in post_likes table
   - Prevents duplicate likes at DB level

### DELETE Unlike a post that was never liked
   - Unlike made idempotent in post/service.py unlike_post_svc()
   - Returns 200 even if post was never liked

---

## Follows & Social Graph

### POST Follow yourself
   - Validation added in profile/service.py follow_svc()
   - Returns False if follower_id == following_id

### POST Mutual unfollow race condition
   - DELETE uses WHERE clause (idempotent)
   - Both requests succeed without error

---

## Blocks & Privacy

### POST Block a user who is currently viewing your live content
   - Block system implemented in auth/models.py (Block model)
   - Block/unblock endpoints in profile/views.py

### POST Block then unblock — does old follow relationship restore?
   - Block removes follow relationship in profile/service.py block_svc()
   - Unblock does not restore follow (must re-follow manually)

### DELETE Delete a block that doesn't exist
   - Unblock made idempotent in profile/service.py unblock_svc()
   - Returns 200 even if block doesn't exist

---

## Feed & Discovery

### GET Feed includes posts from a user you blocked 1 second ago
   - Real-time block filter in post/service.py get_random_posts_svc()
   - Feed generation applies block filter before returning

### GET Pagination cursor points to a now-deleted post
   - Post status filter added to feed queries
   - Only active posts returned

### GET Explore page returns content from a blocked account
   - Block filter in hashtag search in post/service.py get_posts_from_hashtag_svc()
   - Blocked users' posts excluded from results

---

## Additional Coverage

### GET Fetching a post from a user who blocked you
   - Block check added in post/views.py get_post()
   - Returns 404 if requester is blocked by post author

---

## Key Implementations

- Block system with Block model and endpoints
- Post status field for soft delete
- Unique constraint on post_likes for race condition prevention
- Idempotent unlike operation
- IntegrityError handling for username/email race condition
- Follow yourself validation
- Block filters in feed and hashtag search
- Block check in individual post fetching
- is_private and deleted_at fields in User model (for future implementation)

## Files Modified

- src/auth/models.py (Block model, User fields)
- src/post/models.py (PostStatus enum, status field, unique constraint)
- src/post/service.py (block filters, status filtering)
- src/post/views.py (block check in get_post)
- src/profile/service.py (block/unblock, follow validation)
- src/profile/views.py (block/unblock endpoints)
- src/auth/service.py (IntegrityError handling)
- src/auth/views.py (signup updated for IntegrityError)
