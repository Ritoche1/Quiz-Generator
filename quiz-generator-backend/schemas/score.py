from pydantic import BaseModel
from datetime import datetime

class ScoreCreate(BaseModel):
    score: int
    max_score: int
    answers: dict

class ScoreResponse(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    score: int
    max_score: int
    created_at: datetime