from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from database.models import User, Friendship

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user_data: dict):
    user = User(**user_data)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# Friendship helpers
async def create_friend_request(db: AsyncSession, requester_id: int, addressee_id: int):
    # prevent self add
    if requester_id == addressee_id:
        return None
    # check if existing relation (any direction)
    existing_result = await db.execute(
        select(Friendship)
        .where(
            or_(
                and_(Friendship.requester_id == requester_id, Friendship.addressee_id == addressee_id),
                and_(Friendship.requester_id == addressee_id, Friendship.addressee_id == requester_id)
            )
        )
    )
    existing = existing_result.scalars().first()
    if existing:
        # If reverse pending exists (they already requested you), auto-accept
        if existing.status == 'pending' and existing.requester_id == addressee_id and existing.addressee_id == requester_id:
            existing.status = 'accepted'
            await db.commit()
            await db.refresh(existing)
            return existing
        # If previously declined, allow a new attempt by reusing the record and resetting direction
        if existing.status == 'declined':
            existing.requester_id = requester_id
            existing.addressee_id = addressee_id
            existing.status = 'pending'
            await db.commit()
            await db.refresh(existing)
            return existing
        # Block when a pending (same direction) or accepted relation exists
        return None

    fr = Friendship(requester_id=requester_id, addressee_id=addressee_id, status='pending')
    db.add(fr)
    await db.commit()
    await db.refresh(fr)
    return fr

async def update_friend_request_status(db: AsyncSession, friendship_id: int, user_id: int, status: str):
    fr = await db.get(Friendship, friendship_id)
    if not fr:
        return None
    # only addressee can accept/decline
    if fr.addressee_id != user_id:
        return None
    fr.status = status
    await db.commit()
    await db.refresh(fr)
    return fr

async def delete_friendship(db: AsyncSession, friendship_id: int, user_id: int):
    fr = await db.get(Friendship, friendship_id)
    if not fr:
        return None
    # either party can delete after accepted; requester can cancel pending
    if fr.requester_id != user_id and fr.addressee_id != user_id:
        return None
    await db.delete(fr)
    await db.commit()
    return fr

async def list_friends(db: AsyncSession, user_id: int):
    # accepted friendships in either direction
    result = await db.execute(
        select(Friendship)
        .where(Friendship.status == 'accepted')
        .where(or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id))
        .order_by(Friendship.updated_at.desc())
    )
    return result.scalars().all()

async def list_pending_requests(db: AsyncSession, user_id: int):
    # incoming pending requests
    result = await db.execute(
        select(Friendship)
        .where(Friendship.status == 'pending')
        .where(Friendship.addressee_id == user_id)
        .order_by(Friendship.created_at.desc())
    )
    return result.scalars().all()

async def list_outgoing_requests(db: AsyncSession, user_id: int):
    # outgoing pending requests (requests you sent)
    result = await db.execute(
        select(Friendship)
        .where(Friendship.status == 'pending')
        .where(Friendship.requester_id == user_id)
        .order_by(Friendship.created_at.desc())
    )
    return result.scalars().all()

async def search_users(db: AsyncSession, query: str, limit: int = 10):
    q = f"%{query.lower()}%"
    result = await db.execute(
        select(User).where(or_(User.username.ilike(q), User.email.ilike(q))).limit(limit)
    )
    return result.scalars().all()