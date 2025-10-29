from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    data: Optional[Dict[str, Any]] = None
    is_read: bool = False

class NotificationCreate(BaseModel):
    user_id: int
    type: str
    actor_user_id: Optional[int] = None
    data: Optional[Dict[str, Any]] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    actor_user_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UnreadCountResponse(BaseModel):
    unread: int
