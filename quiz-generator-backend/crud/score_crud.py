from sqlalchemy.ext.asyncio import AsyncSession
from database.models import UserScore, Quiz
from sqlalchemy import select, delete

async def create_score(db: AsyncSession, score_data: dict):
    new_score = UserScore(**score_data)
    db.add(new_score)
    await db.commit()
    await db.refresh(new_score)
    return new_score

async def update_score_db(db: AsyncSession, score_id: int, score_data: dict, user_id: int):
    score = await db.get(UserScore, score_id)
    if not score or score.user_id != user_id:
        return None
    for key, value in score_data.items():
        setattr(score, key, value)
    try:
        await db.commit()
        await db.refresh(score)
    except Exception as e:
        await db.rollback()
        print("Error during update:", e)
        return None
    return score

async def get_score_for_quiz(db: AsyncSession, quiz_id: int, user_id: int):
    result = await db.execute(
        select(UserScore)
        .where(UserScore.quiz_id == quiz_id)
        .where(UserScore.user_id == user_id)
        .order_by(UserScore.score.desc())
    )
    return result.scalars().first()

async def get_user_scores(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(UserScore, Quiz.title, Quiz.language, Quiz.difficulty)
        .join(Quiz, UserScore.quiz_id == Quiz.id)
        .where(UserScore.user_id == user_id)
        .order_by(UserScore.created_at.desc())
    )
    return result

async def delete_score_db(db: AsyncSession, score_id: int, user_id: int):

    score = await db.get(UserScore, score_id)
    if not score or score.user_id != user_id:
        return None
    try:
        await db.delete(score)
        await db.commit()
    except Exception as e:
        await db.rollback()
        print("Error during deletion:", e)
        return None
    return score