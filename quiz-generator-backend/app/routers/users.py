from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.database import get_db
from database.models import User, UserScore, Quiz
from app.routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/stats")
async def get_user_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get stats for the current user"""
    # Total quizzes taken
    total_result = await db.execute(
        select(func.count(UserScore.id)).where(UserScore.user_id == current_user.id)
    )
    total_taken = total_result.scalar() or 0

    # Average score percentage
    avg_result = await db.execute(
        select(func.avg(UserScore.score * 100.0 / UserScore.max_score))
        .where(UserScore.user_id == current_user.id)
        .where(UserScore.max_score > 0)
    )
    avg_score = round(avg_result.scalar() or 0)

    # Best score percentage
    best_result = await db.execute(
        select(func.max(UserScore.score * 100.0 / UserScore.max_score))
        .where(UserScore.user_id == current_user.id)
        .where(UserScore.max_score > 0)
    )
    best_score = round(best_result.scalar() or 0)

    # Current streak (consecutive days with at least one quiz)
    scores_result = await db.execute(
        select(UserScore.created_at)
        .where(UserScore.user_id == current_user.id)
        .order_by(UserScore.created_at.desc())
    )
    dates = scores_result.scalars().all()
    streak = 0
    if dates:
        from datetime import datetime, timedelta
        unique_days = sorted(set(d.date() for d in dates), reverse=True)
        if unique_days:
            expected = unique_days[0]
            today = datetime.utcnow().date()
            # Only count streak if most recent activity is today or yesterday
            if expected >= today - timedelta(days=1):
                for day in unique_days:
                    if day == expected:
                        streak += 1
                        expected -= timedelta(days=1)
                    else:
                        break

    return {
        "totalTaken": total_taken,
        "avgScore": avg_score,
        "bestScore": best_score,
        "streak": streak
    }
