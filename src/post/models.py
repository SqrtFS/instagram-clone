from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class PostStatus(enum.Enum):
    active = "active"
    deleted = "deleted"


post_hashtags = Table(
    "post_hashtags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id")),
    Column("hashtag_id", Integer, ForeignKey("hashtags.id")),
)

post_likes = Table(
    "post_likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("post_id", Integer, ForeignKey("posts.id")),
    UniqueConstraint("user_id", "post_id", name="uq_user_post_like"),
)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    image = Column(String)
    location = Column(String)
    created_dt = Column(DateTime, default=datetime.utcnow())
    likes_count = Column(Integer, default=0)
    status = Column(Enum(PostStatus), default=PostStatus.active)

    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("auth.models.User", back_populates="posts")

    hashtags = relationship("Hashtag", secondary=post_hashtags, back_populates="posts")

    liked_by_users = relationship(
        "auth.models.User", secondary=post_likes, back_populates="liked_posts"
    )


class Hashtag(Base):
    __tablename__ = "hashtags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    posts = relationship("Post", secondary=post_hashtags, back_populates="hashtags")