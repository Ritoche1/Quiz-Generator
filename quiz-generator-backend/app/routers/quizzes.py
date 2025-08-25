from fastapi import APIRouter, Depends, HTTPException
from database.database import get_db
from database.models import User
from app.routers.auth import get_current_user
from crud.quiz_crud import *
from schemas.quiz import *

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.post("", response_model=QuizResponse, include_in_schema=False)
@router.post("/", response_model=QuizResponse)
async def create_new_quiz(quiz: QuizCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz_data = quiz.dict()
    quiz_data["questions"] = [q.dict() for q in quiz.questions]
    return await create_quiz(db, quiz_data)

@router.get("/", response_model=List[QuizResponse])
async def fetch_all_quizzes(db: AsyncSession = Depends(get_db)):
    return await get_all_quizzes(db)

@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_single_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

# Add to existing imports
from sqlalchemy import func

# Add these endpoints to the router
@router.get("/count")
async def get_quiz_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(Quiz.id)))
    return {"count": result.scalar()}

@router.get("/{quiz_id}/scores/count")
async def get_quiz_attempts(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(UserScore.id))
        .where(UserScore.quiz_id == quiz_id)
    )
    return {"attempts": result.scalar()}
