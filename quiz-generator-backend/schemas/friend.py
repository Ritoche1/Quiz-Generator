from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class UserLite(BaseModel):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None

    # Pydantic v2: enable attribute-based validation for ORM objects
    model_config = ConfigDict(from_attributes=True)

class FriendshipResponse(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str

    # Pydantic v2: enable attribute-based validation for ORM objects
    model_config = ConfigDict(from_attributes=True)

class FriendListItem(BaseModel):
    id: int
    status: str
    friend_user: UserLite

class PendingRequestItem(BaseModel):
    id: int
    status: str
    requester_user: UserLite

class OutgoingRequestItem(BaseModel):
    id: int
    status: str
    addressee_user: UserLite
