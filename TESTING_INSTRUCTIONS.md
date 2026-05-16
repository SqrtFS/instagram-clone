# Edge Cases Testing Instructions

## Start Server

```bash
uvicorn src.main:app --reload
```

Server will be available at http://127.0.0.1:8000

---

## 1. POST Register with already-used email (case-insensitive)

**Step 1: Create first user**
```bash
curl -X POST "http://127.0.0.1:8000/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"test@example.com","password":"pass123","name":"Test User"}'
```

**Step 2: Attempt to create user with same email in different case**
```bash
curl -X POST "http://127.0.0.1:8000/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"user2","email":"TEST@EXAMPLE.COM","password":"pass123","name":"Test User 2"}'
```

**Expected result:** Second request should return 409 Conflict with message "username or email already in use"

---

## 2. POST Username race condition on signup

**Step 1: Run two simultaneous requests with same username**
```bash
# In one terminal:
curl -X POST "http://127.0.0.1:8000/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"racer1","email":"racer1@example.com","password":"pass123","name":"Racer 1"}' &

# In another terminal (simultaneously):
curl -X POST "http://127.0.0.1:8000/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"racer1","email":"racer2@example.com","password":"pass123","name":"Racer 2"}' &
```

**Expected result:** One request should return 201, the other should return 409 Conflict

---

## 3. DELETE Delete a post that has been shared/reposted (Soft Delete)

**Step 1: Create user and get token**
```bash
curl -X POST "http://127.0.0.1:8000/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"poster","email":"poster@example.com","password":"pass123","name":"Poster"}'
```

Save the access_token from response.

**Step 2: Create post**
```bash
curl -X POST "http://127.0.0.1:8000/v1/posts/" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test post","token":"YOUR_TOKEN"}'
```

Save the post_id from response.

**Step 3: Delete post**
```bash
curl -X DELETE "http://127.0.0.1:8000/v1/posts/?post_id=POST_ID&token=YOUR_TOKEN"
```

**Step 4: Attempt to fetch deleted post**
```bash
curl -X GET "http://127.0.0.1:8000/v1/posts/POST_ID"
```

**Expected result:** Post should have status='deleted' in database, but record should not be physically deleted

---

## 4. POST Double like race condition

**Step 1: Create user and post (as in test 3)**

**Step 2: Send two simultaneous likes**
```bash
# In one terminal:
curl -X POST "http://127.0.0.1:8000/v1/posts/like?post_id=POST_ID&username=poster" &

# In another terminal (simultaneously):
curl -X POST "http://127.0.0.1:8000/v1/posts/like?post_id=POST_ID&username=poster" &
```

**Expected result:** Only one like should be created thanks to unique constraint on (user_id, post_id)

---

## 5. DELETE Unlike a post that was never liked (Idempotent)

**Step 1: Attempt to unlike a post that was never liked**
```bash
curl -X POST "http://127.0.0.1:8000/v1/posts/unlike?post_id=POST_ID&username=poster"
```

**Expected result:** Should return 200 OK (not 404), operation is idempotent

---

## 6. POST Follow yourself

**Step 1: Attempt to follow yourself**
```bash
curl -X POST "http://127.0.0.1:8000/v1/profile/follow/poster?token=YOUR_TOKEN"
```

**Expected result:** Should return 409 Conflict with message "could not follow"

---

## 7. POST Mutual unfollow race condition

**Step 1: Create two users and have them follow each other**
```bash
# Create user1 and user2, get their tokens

# User1 follows user2
curl -X POST "http://127.0.0.1:8000/v1/profile/follow/user2?token=USER1_TOKEN"

# User2 follows user1
curl -X POST "http://127.0.0.1:8000/v1/profile/follow/user1?token=USER2_TOKEN"
```

**Step 2: Send two simultaneous unfollow requests**
```bash
# User1 unfollows user2
curl -X POST "http://127.0.0.1:8000/v1/profile/unfollow/user2?token=USER1_TOKEN" &

# User2 unfollows user1 (simultaneously)
curl -X POST "http://127.0.0.1:8000/v1/profile/unfollow/user1?token=USER2_TOKEN" &
```

**Expected result:** Both requests should complete successfully without errors

---

## 8. POST Block a user

**Step 1: Create two users**

**Step 2: User1 blocks user2**
```bash
curl -X POST "http://127.0.0.1:8000/v1/profile/block/user2?token=USER1_TOKEN"
```

**Expected result:** Should return 204 No Content, follow relationship should be removed

---

## 9. POST Block then unblock

**Step 1: Block user (as in test 8)**

**Step 2: Unblock**
```bash
curl -X POST "http://127.0.0.1:8000/v1/profile/unblock/user2?token=USER1_TOKEN"
```

**Step 3: Check that follow relationship is not restored**
```bash
curl -X GET "http://127.0.0.1:8000/v1/profile/following?token=USER1_TOKEN"
```

**Expected result:** Unblock should not restore follow relationship

---

## 10. DELETE Delete a block that doesn't exist (Idempotent)

**Step 1: Attempt to unblock a user who was not blocked**
```bash
curl -X POST "http://127.0.0.1:8000/v1/profile/unblock/user2?token=USER1_TOKEN"
```

**Expected result:** Should return 204 No Content (not 404), operation is idempotent

---

## 11. GET Feed includes posts from blocked user

**Step 1: User1 blocks user2**

**Step 2: User2 creates a post**

**Step 3: User1 requests feed**
```bash
curl -X GET "http://127.0.0.1:8000/v1/posts/feed?token=USER1_TOKEN"
```

**Expected result:** User2's posts should not appear in user1's feed

---

## 12. GET Pagination on deleted post

**Step 1: Create multiple posts**

**Step 2: Delete one of the posts**

**Step 3: Request feed with pagination**
```bash
curl -X GET "http://127.0.0.1:8000/v1/posts/feed?page=1&limit=5"
```

**Expected result:** Deleted posts should not appear in results

---

## 13. GET Explore shows blocked content

**Step 1: User1 blocks user2**

**Step 2: User2 creates a post with hashtag #test**

**Step 3: User1 requests posts by hashtag**
```bash
curl -X GET "http://127.0.0.1:8000/v1/posts/hashtag/test?token=USER1_TOKEN"
```

**Expected result:** User2's posts should not appear in results

---

## 14. GET Fetching post from blocked user

**Step 1: User1 blocks user2**

**Step 2: User2 creates a post**

**Step 3: User1 attempts to fetch the post**
```bash
curl -X GET "http://127.0.0.1:8000/v1/posts/POST_ID?token=USER1_TOKEN"
```

**Expected result:** Should return 404 Not Found (not 403)

---

## Database Verification

To check database state using SQLite:

```bash
sqlite3 src/db.sql
```

**Check users:**
```sql
SELECT * FROM users;
```

**Check posts and their status:**
```sql
SELECT * FROM posts;
```

**Check blocks:**
```sql
SELECT * FROM blocks;
```

**Check likes:**
```sql
SELECT * FROM post_likes;
```

**Check follow relationships:**
```sql
SELECT * FROM follows;
```

---

## Useful Commands

**Reset database:**
```bash
rm src/db.sql
```

**View all tables:**
```sql
.tables
```

**View table schema:**
```sql
.schema posts
```
