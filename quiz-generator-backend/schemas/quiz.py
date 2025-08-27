from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional
from datetime import datetime

class QuestionSchema(BaseModel):
    question: str
    options: List[str]
    answer: str

    # Pydantic v2
    model_config = ConfigDict(from_attributes=True)

class QuizCreate(BaseModel):
    title: str
    description: str
    language: str
    difficulty: str
    questions: List[QuestionSchema]
    is_public: Optional[bool] = False

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    difficulty: Optional[str] = None
    questions: Optional[List[QuestionSchema]] = None
    is_public: Optional[bool] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    description: str
    language: str
    difficulty: str
    questions: List[Dict]
    created_at: datetime
    is_public: bool

    # Pydantic v2
    model_config = ConfigDict(from_attributes=True)