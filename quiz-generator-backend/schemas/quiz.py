from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class QuestionSchema(BaseModel):
    question: str
    options: List[str]
    answer: str

    class Config:
        orm_mode = True

class QuizCreate(BaseModel):
    title: str
    description: str
    language: str
    difficulty: str
    questions: List[QuestionSchema]

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    difficulty: Optional[str] = None
    questions: Optional[List[QuestionSchema]] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    description: str
    language: str
    difficulty: str
    questions: List[Dict]
    created_at: datetime

    class Config:
        orm_mode = True