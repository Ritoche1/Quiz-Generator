from crud.quiz_crud import create_quiz

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
        "title": topic,
        "description": f"Auto-generated {difficulty} quiz about {topic}",
        "language": language,
        "difficulty": difficulty,
        "questions": questions,
        "owner_id": owner_id,
        "is_public": is_public,
    }
    return await create_quiz(db, quiz_data)