from sqlalchemy.ext.asyncio import AsyncSession
from database.models import UserScore

async def create_score(db: AsyncSession, score_data: dict):
    new_score = UserScore(**score_data)
    db.add(new_score)
    await db.commit()
    await db.refresh(new_score)
    return new_score

async def get_scores_for_quiz(db: AsyncSession, quiz_id: int, user_id: int):
    result = await db.execute(
        select(UserScore)
        .where(UserScore.quiz_id == quiz_id)
        .where(UserScore.user_id == user_id)
        .order_by(UserScore.score.desc())
    )
    return result.scalars().all()