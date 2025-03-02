from fastapi import APIRouter, Depends, HTTPException
from app.services.mistral_service import generate_quiz_content
from app.services.quiz_service import save_generated_quiz
from database.database import get_db
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

@router.post("/quiz", response_model=List[QuizQuestion])
async def generate_quiz_endpoint(
    quiz_request: QuizRequest,
    db=Depends(get_db)
):
    try:
        # Generate quiz content
        quiz_data = await generate_quiz_content(
            quiz_request.topic,
            quiz_request.difficulty,
            quiz_request.language
        )
        
        return quiz_data["quiz"]["questions"]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )