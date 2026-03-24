import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.routers.auth import get_current_user
from app.services.mistral_service import generate_quiz_content
from app.services.quiz_service import save_generated_quiz
from database.database import get_db
from database.models import User, Generation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["quiz-generation"])

class QuizRequest(BaseModel):
    topic: str
    difficulty: str
    language: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str

class GeneratedQuizResponse(BaseModel):
    id: int
    title: str
    language: str
    difficulty: str
    questions: List[QuizQuestion]

# Daily generation limit per user
DAILY_GENERATION_LIMIT = 5

@router.post("/quiz", response_model=GeneratedQuizResponse)
async def generate_quiz_endpoint(
    quiz_request: QuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Count today's generations for the user
        today = datetime.now(timezone.utc).date()
        today_start = datetime.combine(today, datetime.min.time())
        q = select(func.count(Generation.id)).where(
            Generation.user_id == current_user.id,
            Generation.created_at >= today_start,
        )
        result = await db.execute(q)
        used = result.scalar() or 0

        if used >= DAILY_GENERATION_LIMIT:
            raise HTTPException(status_code=429, detail="Daily generation limit reached")

        # Generate quiz content
        quiz_data = await generate_quiz_content(
            quiz_request.topic,
            quiz_request.difficulty,
            quiz_request.language,
        )
        questions = quiz_data["quiz"]["questions"]

        # Persist quiz immediately (private by default)
        saved = await save_generated_quiz(
            topic=quiz_request.topic,
            difficulty=quiz_request.difficulty,
            language=quiz_request.language,
            questions=questions,
            db=db,
            owner_id=current_user.id,
            is_public=False,
        )

        # Log the generation event
        gen = Generation(user_id=current_user.id)
        db.add(gen)
        await db.commit()

        return {
            "id": saved.id,
            "title": saved.title,
            "language": saved.language,
            "difficulty": saved.difficulty,
            "questions": questions,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Quiz generation failed")
        raise HTTPException(
            status_code=500,
            detail="Quiz generation failed. Please try again later.",
        )

@router.get('/remaining')
async def get_remaining_generations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Count today's generations for the user
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time())
    q = select(func.count(Generation.id)).where(
        Generation.user_id == current_user.id,
        Generation.created_at >= today_start,
    )
    result = await db.execute(q)
    used = result.scalar() or 0

    return {"remaining": max(0, DAILY_GENERATION_LIMIT - used)}