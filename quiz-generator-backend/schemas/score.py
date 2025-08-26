from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

class ScoreBase(BaseModel):
    score: int
    max_score: int
    answers: Dict[int, Any]

class ScoreCreate(ScoreBase):
    pass

class ScoreResponse(ScoreBase):
    id: int
    quiz_id: int
    user_id: int

    # Pydantic v2 config
    model_config = ConfigDict(from_attributes=True)

class ScoreUpdate(BaseModel):
    score: Optional[int] = None
    max_score: Optional[int] = None
    answers: Optional[Dict[int, Any]] = None

# Friendship schemas
class FriendshipCreate(BaseModel):
    addressee_id: int

class FriendshipUpdateStatus(BaseModel):
    status: str  # 'accepted' | 'declined'

class FriendshipResponse(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str

    # Pydantic v2: enable from_orm via from_attributes
    model_config = ConfigDict(from_attributes=True)