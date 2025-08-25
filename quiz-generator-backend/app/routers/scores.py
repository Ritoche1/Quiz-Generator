from fastapi import APIRouter, Depends, HTTPException
from database.database import get_db
from database.models import User
from app.routers.auth import get_current_user
from crud.score_crud import *
from schemas.score import *
from typing import List

router = APIRouter(prefix="/scores", tags=["scores"])

@router.post("/{quiz_id}", response_model=ScoreResponse)
async def submit_score(
    quiz_id: int,
    score: ScoreCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    score_data = score.dict()
    score_data["quiz_id"] = quiz_id
    score_data["user_id"] = current_user.id
    return await create_score(db, score_data)

@router.put("/{score_id}", response_model=ScoreResponse)
async def update_score(
    score_id: int,
    score: ScoreUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    score_data = score.dict()
    return await update_score_db(db, score_id, score_data, current_user.id)

@router.get("/{quiz_id}", response_model=ScoreResponse)
async def get_quiz_scores(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reponse = await get_score_for_quiz(db, quiz_id, current_user.id)
    if not reponse:
        raise HTTPException(status_code=404, detail="Score not found")
    return reponse


@router.get("/user/history", response_model=List[dict])
async def get_user_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await get_user_scores(db, current_user.id)
    return [{
        "score_id": score.id,
        "quiz_id": score.quiz_id,
        "language": language,
        "difficulty": difficulty,
        "title": title,
        "score": score.score,
        "max_score": score.max_score,
        "date": score.created_at
    } for score, title, language, difficulty in result.all()]

@router.delete("/{score_id}")
async def delete_score(
    score_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    score = await delete_score_db(db, score_id, current_user.id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"status": "success"}