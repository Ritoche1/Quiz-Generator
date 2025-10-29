from sqlalchemy import update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from database.models import Quiz
from sqlalchemy.sql import select

async def create_quiz(db: AsyncSession, quiz_data: dict):
    new_quiz = Quiz(**quiz_data)
    db.add(new_quiz)
    await db.commit()
    await db.refresh(new_quiz)
    return new_quiz

async def get_quiz(db: AsyncSession, quiz_id: int):
    return await db.get(Quiz, quiz_id)

async def get_all_quizzes(db: AsyncSession):
    result = await db.execute(select(Quiz))
    return result.scalars().all()

async def update_quiz(db: AsyncSession, quiz_id: int, update_data: dict):
    await db.execute(
        update(Quiz)
        .where(Quiz.id == quiz_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_quiz(db, quiz_id)

async def delete_quiz(db: AsyncSession, quiz_id: int):
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        return False

    # Remove dependent rows in user_scores to prevent FK violation
    from database.models import UserScore
    await db.execute(delete(UserScore).where(UserScore.quiz_id == quiz_id))

    await db.delete(quiz)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    return True