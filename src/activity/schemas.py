from pydantic import BaseModel
from datetime import datetime


class ActivityBase(BaseModel):
    username: str


class LikeActivityCreate(ActivityBase):
    liked_post_id: int
    username_like: str


class FollowActivityCreate(ActivityBase):
    followed_username: str


class Activity(ActivityBase):
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }