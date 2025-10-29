from typing import List

from sqlalchemy import select, or_, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Friendship, User


async def create_friend_request(db: AsyncSession, requester_id: int, addressee_id: int):
    """Create a friend request or auto-accept when the other user already requested you."""
    if requester_id == addressee_id:
        return None

    stmt = select(Friendship).where(
        or_(
            and_(
                Friendship.requester_id == requester_id,
                Friendship.addressee_id == addressee_id,
            ),
            and_(
                Friendship.requester_id == addressee_id,
                Friendship.addressee_id == requester_id,
            ),
        )
    )
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        if (
            existing.status == "pending"
            and existing.requester_id == addressee_id
            and existing.addressee_id == requester_id
        ):
            existing.status = "accepted"
            await db.commit()
            await db.refresh(existing)
            return existing
        return None

    friendship = Friendship(
        requester_id=requester_id,
        addressee_id=addressee_id,
        status="pending",
    )
    db.add(friendship)
    await db.commit()
    await db.refresh(friendship)
    return friendship


async def update_friend_request_status(
    db: AsyncSession,
    friendship_id: int,
    acting_user_id: int,
    status: str,
):
    fr = await db.get(Friendship, friendship_id)
    if not fr or fr.addressee_id != acting_user_id or fr.status != "pending":
        return None

    fr.status = status
    await db.commit()
    await db.refresh(fr)
    return fr


async def delete_friendship(db: AsyncSession, friendship_id: int, acting_user_id: int):
    fr = await db.get(Friendship, friendship_id)
    if not fr or acting_user_id not in {fr.requester_id, fr.addressee_id}:
        return None

    await db.delete(fr)
    await db.commit()
    return fr


async def list_friends(db: AsyncSession, user_id: int) -> List[Friendship]:
    stmt = (
        select(Friendship)
        .where(
            Friendship.status == "accepted",
            or_(
                Friendship.requester_id == user_id,
                Friendship.addressee_id == user_id,
            ),
        )
        .order_by(Friendship.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def list_pending_requests(db: AsyncSession, user_id: int) -> List[Friendship]:
    stmt = (
        select(Friendship)
        .where(
            Friendship.status == "pending",
            Friendship.addressee_id == user_id,
        )
        .order_by(Friendship.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def list_outgoing_requests(db: AsyncSession, user_id: int) -> List[Friendship]:
    stmt = (
        select(Friendship)
        .where(
            Friendship.status == "pending",
            Friendship.requester_id == user_id,
        )
        .order_by(Friendship.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def search_users(db: AsyncSession, query: str, limit: int = 20) -> List[User]:
    like = f"%{query.lower()}%"
    stmt = (
        select(User)
        .where(
            or_(
                func.lower(User.username).like(like),
                func.lower(User.email).like(like),
            )
        )
        .order_by(func.lower(User.username).asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
