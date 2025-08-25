from fastapi import APIRouter, Depends, HTTPException
from database.database import get_db
from database.models import User, Quiz, UserScore
from app.routers.auth import get_current_user
from crud.quiz_crud import create_quiz, get_quiz, update_quiz, delete_quiz
from schemas.quiz import QuizCreate, QuizResponse, QuizUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

router = APIRouter(prefix="/editor", tags=["editor"])

@router.post("/quiz", response_model=QuizResponse)
async def create_custom_quiz(
    quiz: QuizCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a new custom quiz"""
    quiz_data = quiz.dict()
    quiz_data["questions"] = [q.dict() for q in quiz.questions]
    quiz_data["creator_id"] = current_user.id
    return await create_quiz(db, quiz_data)

@router.get("/quiz/{quiz_id}", response_model=QuizResponse)
async def get_quiz_for_editing(
    quiz_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get a quiz for editing (only if user owns it)"""
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # In a full implementation, check if user owns the quiz
    # For now, allow access to any quiz for editing
    return quiz

@router.put("/quiz/{quiz_id}", response_model=QuizResponse)
async def update_custom_quiz(
    quiz_id: int,
    quiz_update: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a custom quiz"""
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # In a full implementation, check if user owns the quiz
    # For now, allow updating any quiz
    
    quiz_data = quiz_update.dict(exclude_unset=True)
    if "questions" in quiz_data:
        quiz_data["questions"] = [q.dict() for q in quiz_update.questions]
    
    return await update_quiz(db, quiz_id, quiz_data)

@router.delete("/quiz/{quiz_id}")
async def delete_custom_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a custom quiz"""
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # In a full implementation, check if user owns the quiz
    # For now, allow deleting any quiz
    
    success = await delete_quiz(db, quiz_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete quiz")
    
    return {"message": "Quiz deleted successfully"}

@router.get("/my-quizzes", response_model=List[QuizResponse])
async def get_my_created_quizzes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all quizzes created by the current user"""
    # In a full implementation, filter by creator_id
    # For now, return all quizzes (mock data)
    result = await db.execute(select(Quiz).limit(10))
    return result.scalars().all()

@router.post("/quiz/{quiz_id}/duplicate", response_model=QuizResponse)
async def duplicate_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a duplicate of an existing quiz for editing"""
    original_quiz = await get_quiz(db, quiz_id)
    if not original_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Create duplicate with modified title
    duplicate_data = {
        "title": f"{original_quiz.title} (Copy)",
        "description": original_quiz.description,
        "language": original_quiz.language,
        "difficulty": original_quiz.difficulty,
        "questions": original_quiz.questions,
        "creator_id": current_user.id
    }
    
    return await create_quiz(db, duplicate_data)

@router.post("/validate")
async def validate_quiz(quiz_data: QuizCreate):
    """Validate a quiz before saving"""
    errors = []
    
    # Validate title
    if not quiz_data.title or len(quiz_data.title.strip()) < 3:
        errors.append("Title must be at least 3 characters long")
    
    # Validate questions
    if not quiz_data.questions or len(quiz_data.questions) == 0:
        errors.append("Quiz must have at least one question")
    
    for i, question in enumerate(quiz_data.questions):
        if not question.question or len(question.question.strip()) < 5:
            errors.append(f"Question {i+1}: Question text must be at least 5 characters long")
        
        if not question.options or len(question.options) < 2:
            errors.append(f"Question {i+1}: Must have at least 2 options")
        
        if not question.answer or question.answer not in question.options:
            errors.append(f"Question {i+1}: Must select a valid answer from the options")
        
        # Check for empty options
        for j, option in enumerate(question.options):
            if not option or len(option.strip()) == 0:
                errors.append(f"Question {i+1}, Option {j+1}: Cannot be empty")
    
    if errors:
        return {"valid": False, "errors": errors}
    
    return {"valid": True, "message": "Quiz is valid"}

@router.get("/templates")
async def get_quiz_templates():
    """Get predefined quiz templates for quick start"""
    templates = [
        {
            "id": "general-knowledge",
            "title": "General Knowledge Template",
            "description": "A basic general knowledge quiz template",
            "difficulty": "easy",
            "language": "English",
            "questions": [
                {
                    "question": "What is the capital of France?",
                    "options": ["London", "Berlin", "Paris", "Madrid"],
                    "answer": "Paris"
                },
                {
                    "question": "Which planet is known as the Red Planet?",
                    "options": ["Venus", "Mars", "Jupiter", "Saturn"],
                    "answer": "Mars"
                }
            ]
        },
        {
            "id": "science-basic",
            "title": "Basic Science Template",
            "description": "A basic science quiz template",
            "difficulty": "medium",
            "language": "English",
            "questions": [
                {
                    "question": "What is the chemical symbol for water?",
                    "options": ["H2O", "CO2", "NaCl", "O2"],
                    "answer": "H2O"
                },
                {
                    "question": "What force keeps planets in orbit around the sun?",
                    "options": ["Magnetism", "Gravity", "Friction", "Inertia"],
                    "answer": "Gravity"
                }
            ]
        },
        {
            "id": "history-world",
            "title": "World History Template",
            "description": "A world history quiz template",
            "difficulty": "hard",
            "language": "English",
            "questions": [
                {
                    "question": "In which year did World War II end?",
                    "options": ["1944", "1945", "1946", "1947"],
                    "answer": "1945"
                },
                {
                    "question": "Who was the first person to walk on the moon?",
                    "options": ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
                    "answer": "Neil Armstrong"
                }
            ]
        }
    ]
    
    return templates