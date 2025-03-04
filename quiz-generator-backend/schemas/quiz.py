from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class QuestionSchema(BaseModel):
    question: str
    options: List[str]
    answer: str

class QuizCreate(BaseModel):
    title: str
    description: str
    language: str
    difficulty: str
    questions: List[QuestionSchema]

class QuizResponse(BaseModel):
    id: int
    title: str
    description: str
    language: str
    difficulty: str
    questions: List[Dict]
    created_at: datetime