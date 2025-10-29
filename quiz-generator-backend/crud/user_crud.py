from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import PasswordResetToken, User

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: dict):
    db_user = User(**user)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user_password(db: AsyncSession, user: User, hashed_password: str):
    user.hashed_password = hashed_password
    await db.flush()
    return user

async def invalidate_user_reset_tokens(db: AsyncSession, user_id: int):
    await db.execute(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user_id,
            PasswordResetToken.used_at.is_(None)
        )
        .values(used_at=datetime.utcnow())
    )

async def create_password_reset_token(db: AsyncSession, user_id: int, token: str, expires_at: datetime):
    reset_token = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    await db.flush()
    return reset_token

async def get_password_reset_token(db: AsyncSession, token: str):
    result = await db.execute(select(PasswordResetToken).filter(PasswordResetToken.token == token))
    return result.scalars().first()
