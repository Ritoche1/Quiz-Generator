from crud.quiz_crud import create_quiz
from database.models import Quiz
from datetime import datetime

async def save_generated_quiz(
    topic: str,
    difficulty: str,
    language: str,
    questions: list,
    db,
    owner_id: int,
    is_public: bool = False,
):
    quiz_data = {
        "title": f"{topic} Quiz",
        "description": f"Auto-generated {difficulty} quiz about {topic}",
        "language": language,
        "difficulty": difficulty,
        "questions": questions,
        "owner_id": owner_id,
        "is_public": is_public,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    return await create_quiz(db, quiz_data)