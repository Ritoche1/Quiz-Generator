from crud.quiz_crud import create_quiz
from database.models import Quiz
from datetime import datetime

async def save_generated_quiz(
    topic: str,
    difficulty: str,
    language: str,
    questions: list,
    db
):
    quiz_data = {
        "title": f"{topic} Quiz",
        "description": f"Auto-generated {difficulty} quiz about {topic}",
        "language": language,
        "questions": questions,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    return await create_quiz(db, quiz_data)