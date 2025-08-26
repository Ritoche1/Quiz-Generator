from fastapi import APIRouter, Depends, HTTPException
from app.services.mistral_service import generate_quiz_content
from app.services.quiz_service import save_generated_quiz
from database.database import get_db
from database.models import User
from database.models import Generation
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, date
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/generate", tags=["quiz-generation"])

class QuizRequest(BaseModel):
    topic: str
    difficulty: str
    language: str = "English"

class QuizQuestion(BaseModel):
    question: str
    answer: str
    options: List[str]

# Daily generation limit per user
DAILY_GENERATION_LIMIT = 5

@router.post("/quiz", response_model=List[QuizQuestion])
async def generate_quiz_endpoint(
    quiz_request: QuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Count today's generations for the user
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        q = select(func.count(Generation.id)).where(
            Generation.user_id == current_user.id,
            Generation.created_at >= today_start
        )
        result = await db.execute(q)
        used = result.scalar() or 0

        if used >= DAILY_GENERATION_LIMIT:
            raise HTTPException(status_code=429, detail="Daily generation limit reached")

        # Generate quiz content
        quiz_data = await generate_quiz_content(
            quiz_request.topic,
            quiz_request.difficulty,
            quiz_request.language
        )

        # Log the generation event
        gen = Generation(user_id=current_user.id)
        db.add(gen)
        await db.commit()

        return quiz_data["quiz"]["questions"]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )


@router.get('/remaining')
async def get_remaining_generations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return how many generations remain today for current user"""
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    q = select(func.count(Generation.id)).where(
        Generation.user_id == current_user.id,
        Generation.created_at >= today_start
    )
    result = await db.execute(q)
    used = result.scalar() or 0
    remaining = max(0, DAILY_GENERATION_LIMIT - used)
    return {"remaining": remaining, "limit": DAILY_GENERATION_LIMIT}