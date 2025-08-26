from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from database.models import Notification

async def create_notification(db: AsyncSession, *, user_id: int, type: str, actor_user_id: int | None = None, data: dict | None = None):
    notif = Notification(user_id=user_id, type=type, actor_user_id=actor_user_id, data=data or {})
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif

async def list_notifications(db: AsyncSession, user_id: int, limit: int = 50, offset: int = 0):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()

async def count_unread(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == 0)
    )
    return int(result.scalar() or 0)

async def mark_read(db: AsyncSession, user_id: int, notification_id: int):
    notif = await db.get(Notification, notification_id)
    if not notif or notif.user_id != user_id:
        return None
    notif.is_read = 1
    await db.commit()
    await db.refresh(notif)
    return notif

async def mark_all_read(db: AsyncSession, user_id: int):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == 0)
        .values(is_read=1)
    )
    await db.commit()
    return True
