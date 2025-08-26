from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from database.database import get_db
from database.models import User
from app.routers.auth import get_current_user
from crud.notification_crud import list_notifications, mark_read, mark_all_read, count_unread
from schemas.notification import NotificationResponse, UnreadCountResponse

router = APIRouter(prefix="/notifications", tags=["notifications"]) 

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    notifs = await list_notifications(db, current_user.id, limit=limit, offset=offset)
    return [NotificationResponse.model_validate(n) for n in notifs]

@router.get("/unread", response_model=UnreadCountResponse)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = await count_unread(db, current_user.id)
    return UnreadCountResponse(unread=count)

@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = await mark_read(db, current_user.id, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationResponse.model_validate(notif)

@router.post("/read-all")
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await mark_all_read(db, current_user.id)
    return {"status": "success"}
