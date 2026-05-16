from sqlalchemy.orm import Session

from ..auth.models import User, Follow, Block
from ..activity.models import Activity
from .schemas import FollowersList, FollowingList, Profile
from ..auth.service import get_user_from_user_id, existing_user


async def follow_svc(db: Session, follower: str, following: str):
    db_follower = await existing_user(db, follower, "")
    db_following = await existing_user(db, following, "")
    if not db_follower or not db_following:
        return False
    if db_follower.id == db_following.id:
        return False

    db_follow = (
        db.query(Follow)
        .filter_by(follower_id=db_follower.id, following_id=db_following.id)
        .first()
    )
    if db_follow:
        return False

    db_follow = Follow(follower_id=db_follower.id, following_id=db_following.id)
    db.add(db_follow)

    db_follower.following_count += 1
    db_following.followers_count += 1

    follow_activity = Activity(
        username=following,
        followed_username=db_follower.username,
        followed_user_pic=db_follower.profile_pic,
    )
    db.add(follow_activity)

    db.commit()


# unfollow activity
async def unfollow_svc(db: Session, follower: str, following: str):
    db_follower = await existing_user(db, follower, "")
    db_following = await existing_user(db, following, "")
    if not db_follower or not db_following:
        return False

    db_follow = (
        db.query(Follow)
        .filter_by(follower_id=db_follower.id, following_id=db_following.id)
        .first()
    )
    if not db_follow:
        return False

    db.delete(db_follow)

    db_follower.following_count -= 1
    db_following.followers_count -= 1

    db.commit()


# get followers
async def get_followers_svc(db: Session, user_id: int) -> list[FollowersList]:
    db_user = await get_user_from_user_id(db, user_id)
    if not db_user:
        return []

    db_followers = (
        db.query(Follow)
        .filter_by(following_id=user_id)
        .join(User, User.id == Follow.follower_id)
        .all()
    )

    followers = []
    for user in db_followers:
        followers.append(
            {
                "profile_pic": user.follower.profile_pic,
                "name": user.follower.name,
                "username": user.follower.username,
            }
        )

    return FollowersList(followers=followers)


# get following
async def get_following_svc(db: Session, user_id: int) -> list[FollowingList]:
    db_user = await get_user_from_user_id(db, user_id)
    if not db_user:
        return []

    db_followers = (
        db.query(Follow)
        .filter_by(follower_id=user_id)
        .join(User, User.id == Follow.following_id)
        .all()
    )
    following = []
    for user in db_followers:
        following.append(
            {
                "profile_pic": user.follower.profile_pic,
                "name": user.follower.name,
                "username": user.follower.username,
            }
        )

    return FollowingList(following=following)


async def check_follow_svc(db: Session, current_user: str, user: str):
    db_follower = await existing_user(db, current_user, "")
    db_following = await existing_user(db, user, "")
    if not db_follower or not db_following:
        return False
    db_following = (
        db.query(Follow)
        .filter_by(follower_id=db_follower.id, following_id=db_following.id)
        .first()
    )
    if db_following:
        return True
    return False


async def block_svc(db: Session, blocker: str, blocked: str):
    db_blocker = await existing_user(db, blocker, "")
    db_blocked = await existing_user(db, blocked, "")
    if not db_blocker or not db_blocked:
        return False
    if db_blocker.id == db_blocked.id:
        return False
    db_block = (
        db.query(Block)
        .filter_by(blocker_id=db_blocker.id, blocked_id=db_blocked.id)
        .first()
    )
    if db_block:
        return True
    db_block = Block(blocker_id=db_blocker.id, blocked_id=db_blocked.id)
    db.add(db_block)
    db_follow = (
        db.query(Follow)
        .filter_by(follower_id=db_blocked.id, following_id=db_blocker.id)
        .first()
    )
    if db_follow:
        db.delete(db_follow)
        db_blocker.followers_count -= 1
        db_blocked.following_count -= 1
    db_follow = (
        db.query(Follow)
        .filter_by(follower_id=db_blocker.id, following_id=db_blocked.id)
        .first()
    )
    if db_follow:
        db.delete(db_follow)
        db_blocker.following_count -= 1
        db_blocked.followers_count -= 1
    db.commit()
    return True


async def unblock_svc(db: Session, blocker: str, blocked: str):
    db_blocker = await existing_user(db, blocker, "")
    db_blocked = await existing_user(db, blocked, "")
    if not db_blocker or not db_blocked:
        return True
    db_block = (
        db.query(Block)
        .filter_by(blocker_id=db_blocker.id, blocked_id=db_blocked.id)
        .first()
    )
    if not db_block:
        return True
    db.delete(db_block)
    db.commit()
    return True


async def is_blocked(db: Session, user_id: int, target_id: int):
    return (
        db.query(Block)
        .filter_by(blocker_id=target_id, blocked_id=user_id)
        .first()
        is not None
    )