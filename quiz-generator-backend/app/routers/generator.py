from fastapi import APIRouter, Depends, HTTPException
from app.services.mistral_service import generate_quiz_content
from app.services.quiz_service import save_generated_quiz
from app.services.subscription_service import subscription_service
from database.database import get_db
from database.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import List, Dict, Any

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

class GenerationLimitsResponse(BaseModel):
    used: int
    limit: int
    remaining: int
    can_generate: bool
    subscription_type: str

@router.post("/quiz", response_model=GeneratedQuizResponse)
async def generate_quiz_endpoint(
    quiz_request: QuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Validate user can generate a quiz (checks subscription limits)
        await subscription_service.validate_generation_limit(db, current_user)
        
        # Generate quiz content
        quiz_data = await generate_quiz_content(
            quiz_request.topic,
            quiz_request.difficulty,
            quiz_request.language
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

        # Record the generation event
        await subscription_service.record_generation(db, current_user.id)

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
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )

@router.get('/remaining', response_model=GenerationLimitsResponse)
async def get_remaining_generations(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Get user's daily generation limits and usage."""
    usage = await subscription_service.check_daily_generation_limit(db, current_user)
    
    return GenerationLimitsResponse(
        used=usage['used'],
        limit=usage['limit'],
        remaining=usage['remaining'],
        can_generate=usage['can_generate'],
        subscription_type=usage['subscription_type']
    )

@router.get('/limits', response_model=Dict[str, Any])
async def get_subscription_limits(
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive subscription limits and features for the user."""
    return await subscription_service.get_subscription_limits_info(current_user)