from pydantic import BaseModel

class ScoreCreate(BaseModel):
    user_id: str
    score: int
    max_score: int
    answers: dict

class ScoreResponse(BaseModel):
    id: int
    quiz_id: int
    user_id: str
    score: int
    max_score: int
    created_at: str