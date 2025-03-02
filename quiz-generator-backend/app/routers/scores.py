from fastapi import APIRouter, Depends, HTTPException
from database.database import get_db
from crud.score_crud import *
from schemas.score import *
from typing import List

router = APIRouter(prefix="/scores", tags=["scores"])

@router.post("/{quiz_id}", response_model=ScoreResponse)
async def submit_score(
    quiz_id: int, 
    score: ScoreCreate, 
    db: AsyncSession = Depends(get_db)
):
    score_data = score.dict()
    score_data["quiz_id"] = quiz_id
    return await create_score(db, score_data)

@router.get("/{quiz_id}", response_model=List[ScoreResponse])
async def get_quiz_scores(quiz_id: int, db: AsyncSession = Depends(get_db)):
    return await get_scores_for_quiz(db, quiz_id)