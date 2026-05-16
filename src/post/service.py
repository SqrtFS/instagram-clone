from sqlalchemy.orm import Session
import re
from sqlalchemy import desc, and_

from .schemas import PostCreate, Post as PostSchema, Hashtag as HashtagSchema
from .models import Post, Hashtag, post_hashtags, PostStatus
from ..auth.models import User, Block
from ..auth.schemas import User as UserSchema
from ..activity.models import Activity


# create hashtag from posts' content
# hey #fun
async def create_hashtags_svc(db: Session, post: Post):
    regex = r"#\w+"
    matches = re.findall(regex, post.content)

    for match in matches:
        name = match[1:]

        hashtag = db.query(Hashtag).filter(Hashtag.name == name).first()
        if not hashtag:
            hashtag = Hashtag(name=name)
            db.add(hashtag)
            db.commit()
        post.hashtags.append(hashtag)


# create post
async def create_post_svc(db: Session, post: PostCreate, user_id: int):
    # check if user_id is valid
    db_post = Post(
        content=post.content,
        image=post.image,
        location=post.location,
        author_id=user_id,
    ) 

    await create_hashtags_svc(db, db_post)

    db.add(db_post)
    db.commit()
    return db_post


# get user's posts
async def get_user_posts_svc(db: Session, user_id: int) -> list[PostSchema]:
    posts = (
        db.query(Post)
        .filter(Post.author_id == user_id)
        .order_by(desc(Post.created_dt))
        .all()
    )
    return posts


async def get_posts_from_hashtag_svc(db: Session, hashtag_name: str, user_id: int = None):
    hashtag = db.query(Hashtag).filter_by(name=hashtag_name).first()
    if not hashtag:
        return None
    posts = hashtag.posts
    if user_id:
        blocked_ids = (
            db.query(Block.blocked_id)
            .filter(Block.blocker_id == user_id)
            .all()
        )
        blocked_ids_list = [b[0] for b in blocked_ids]
        if blocked_ids_list:
            posts = [p for p in posts if p.author_id not in blocked_ids_list]
    return posts


async def get_random_posts_svc(
    db: Session, page: int = 1, limit: int = 10, hashtag: str = None, user_id: int = None
):
    total_posts = db.query(Post).filter(Post.status == PostStatus.active).count()

    offset = (page - 1) * limit
    if offset >= total_posts:
        return []

    posts = db.query(Post, User.username).join(User).filter(Post.status == PostStatus.active).order_by(desc(Post.created_dt))

    if hashtag:
        posts = posts.join(post_hashtags).join(Hashtag).filter(Hashtag.name == hashtag)

    if user_id:
        blocked_ids = (
            db.query(Block.blocked_id)
            .filter(Block.blocker_id == user_id)
            .all()
        )
        blocked_ids_list = [b[0] for b in blocked_ids]
        if blocked_ids_list:
            posts = posts.filter(~Post.author_id.in_(blocked_ids_list))

    posts = posts.offset(offset).limit(limit).all()

    result = []
    for post, username in posts:
        post_dict = post.__dict__
        post_dict["username"] = username
        result.append(post_dict)

    return result


# get post by post id
async def get_post_from_post_id_svc(db: Session, post_id: int) -> PostSchema:
    return db.query(Post).filter(Post.id == post_id).first()


# delete post svc
async def delete_post_svc(db: Session, post_id: int):
    post = await get_post_from_post_id_svc(db, post_id)
    db.delete(post)
    db.commit()


# like post
async def like_post_svc(db: Session, post_id: int, username: str):
    post = await get_post_from_post_id_svc(db, post_id)
    if not post:
        return False, "invalid post_id"

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False, "invalid username"

    if user in post.liked_by_users:
        return False, "already liked"

    # increase like count of post
    post.liked_by_users.append(user)
    post.likes_count = len(post.liked_by_users)

    like_activity = Activity(
        username=post.author.username,
        liked_post_id=post_id,
        username_like=username,
        liked_post_image=post.image,
    )
    db.add(like_activity)


    db.commit()
    return True, "done"


async def unlike_post_svc(db: Session, post_id: int, username: str):
    post = await get_post_from_post_id_svc(db, post_id)
    if not post:
        return False, "invalid post_id"

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False, "invalid username"

    if not user in post.liked_by_users:
        return True, "done"

    post.liked_by_users.remove(user)
    post.likes_count = len(post.liked_by_users)

    db.commit()
    return True, "done"


# users who liked post
async def liked_users_post_svc(db: Session, post_id: int) -> list[UserSchema]:
    post = await get_post_from_post_id_svc(db, post_id)
    if not post:
        return []
    liked_users = post.liked_by_users
    return liked_users