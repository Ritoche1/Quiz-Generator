import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.routers.auth import get_current_user
from crud.quiz_crud import create_quiz, get_quiz, get_all_quizzes, update_quiz, delete_quiz
from database.database import get_db
from database.models import User, Quiz, UserScore
from schemas.quiz import QuizCreate, QuizResponse, QuizUpdate

router = APIRouter(prefix="/quizzes", tags=["quizzes"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[QuizResponse])
async def fetch_all_quizzes(db: AsyncSession = Depends(get_db)):
    return await get_all_quizzes(db)

@router.get("/count")
async def get_quiz_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(Quiz.id)))
    return {"count": result.scalar()}

@router.get("/stats/global")
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    """Get global platform statistics"""
    quiz_count = await db.execute(select(func.count(Quiz.id)))
    total_quizzes = quiz_count.scalar()

    # Total users
    user_count = await db.execute(select(func.count(User.id)))
    total_users = user_count.scalar()

    # Average score
    score_avg = await db.execute(
        select(func.avg(UserScore.score * 100 / UserScore.max_score)).where(UserScore.max_score > 0)
    )
    avg_score = int(score_avg.scalar() or 0)

    # Most popular topic (most attempted quiz title)
    popular_topic = await db.execute(
        select(Quiz.title, func.count(UserScore.id).label("attempts"))
        .join(UserScore, Quiz.id == UserScore.quiz_id)
        .group_by(Quiz.title)
        .order_by(func.count(UserScore.id).desc())
        .limit(1)
    )

    top_topic = popular_topic.first()
    popular_topic_name = top_topic.title if top_topic else "JavaScript Fundamentals"

    return {
        "totalQuizzes": total_quizzes,
        "totalUsers": total_users,
        "avgScore": avg_score,
        "topicOfTheWeek": popular_topic_name,
    }

# Leaderboard endpoints
@router.get("/leaderboard/{difficulty}")
async def get_leaderboard_by_difficulty(difficulty: str, db: AsyncSession = Depends(get_db)):
    """Get top performers by difficulty level"""
    result = await db.execute(
        select(
            User.username,
            func.max(UserScore.score).label('best_score'),
            func.avg(UserScore.score).label('avg_score'),
            func.count(UserScore.id).label('total_quizzes'),
            UserScore.max_score
        )
        .join(UserScore, User.id == UserScore.user_id)
        .join(Quiz, UserScore.quiz_id == Quiz.id)
        .where(Quiz.difficulty == difficulty)
        .group_by(User.username, UserScore.max_score)
        .order_by(func.max(UserScore.score).desc())
        .limit(10)
    )

    leaderboard = []
    for row in result:
        leaderboard.append({
            "username": row.username,
            "score": int((row.best_score / row.max_score) * 100) if row.max_score else 0,
            "avgScore": int((row.avg_score / row.max_score) * 100) if row.max_score else 0,
            "totalQuizzes": row.total_quizzes
        })

    return leaderboard

# Browse quizzes with filtering
@router.get("/browse/public")
async def browse_public_quizzes(
    search: str = None,
    difficulty: str = None,
    language: str = None,
    sort_by: str = "created",
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Browse public quizzes with filtering and pagination"""
    query = select(
        Quiz.id.label("quiz_id"),
        Quiz.title.label("title"),
        Quiz.description.label("description"),
        Quiz.language.label("language"),
        Quiz.questions.label("questions"),
        Quiz.difficulty.label("difficulty"),
        Quiz.owner_id.label("owner_id"),
        Quiz.is_public.label("is_public"),
        Quiz.created_at.label("created_at"),
        User.username.label("username"),
    ).join(User, Quiz.owner_id == User.id, isouter=True)

    query = query.where(Quiz.is_public == True)

    if search:
        il = f"%{search}%"
        query = query.where((Quiz.title.ilike(il)) | (Quiz.description.ilike(il)))
    if difficulty and difficulty != "all":
        query = query.where(Quiz.difficulty == difficulty)
    if language and language != "all":
        query = query.where(Quiz.language == language)

    if sort_by == "popular":
        attempts_subq = (
            select(
                UserScore.quiz_id.label("quiz_id"),
                func.count(UserScore.id).label("attempts"),
            )
            .group_by(UserScore.quiz_id)
        ).subquery()
        query = query.outerjoin(attempts_subq, Quiz.id == attempts_subq.c.quiz_id).order_by(
            attempts_subq.c.attempts.desc().nullslast()
        )
    elif sort_by == "difficulty":
        query = query.order_by(Quiz.difficulty.asc())
    else:
        query = query.order_by(Quiz.created_at.desc())

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    quiz_rows = result.mappings().all()

    # Batch-fetch stats for all quiz IDs to avoid N+1 queries
    quiz_ids = [row.get("quiz_id") for row in quiz_rows]
    stats_map = {}
    if quiz_ids:
        stats_result = await db.execute(
            select(
                UserScore.quiz_id,
                func.count(UserScore.id).label("attempts"),
                func.avg(
                    func.case(
                        (UserScore.max_score > 0, UserScore.score * 100 / UserScore.max_score),
                        else_=0,
                    )
                ).label("avg_score"),
            )
            .where(UserScore.quiz_id.in_(quiz_ids))
            .group_by(UserScore.quiz_id)
        )
        for row in stats_result.mappings().all():
            stats_map[row["quiz_id"]] = {
                "attempts": int(row["attempts"] or 0),
                "avg_score": int(row["avg_score"] or 0),
            }

    enhanced_quizzes = []
    for row in quiz_rows:
        quiz_id = row.get("quiz_id")
        creator_name = row.get("username") or "Anonymous"
        questions = row.get("questions") or []
        stats = stats_map.get(quiz_id, {"attempts": 0, "avg_score": 0})

        enhanced_quizzes.append(
            {
                "id": quiz_id,
                "title": row.get("title"),
                "description": row.get("description"),
                "difficulty": row.get("difficulty"),
                "language": row.get("language"),
                "questionsCount": len(questions),
                "attempts": stats["attempts"],
                "avgScore": stats["avg_score"],
                "creator": creator_name,
                "created": row.get("created_at"),
                "tags": [],
                "is_public": bool(row.get("is_public")),
            }
        )

    return enhanced_quizzes

@router.get("/user/created")
async def get_user_created_quizzes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quizzes created by the current user"""
    result = await db.execute(
        select(Quiz)
        .where(Quiz.owner_id == current_user.id)
        .order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    return [{
        "id": q.id,
        "title": q.title,
        "description": q.description,
        "difficulty": q.difficulty,
        "language": q.language,
        "questions": q.questions,
        "is_public": q.is_public,
        "created_at": q.created_at
    } for q in quizzes]

# Parameterized routes MUST come after all static routes
@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_single_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz_endpoint(
    quiz_id: int,
    quiz_update: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if quiz.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this quiz")

    update_data = quiz_update.model_dump(exclude_unset=True)

    updated_quiz = await update_quiz(db, quiz_id, update_data)
    return updated_quiz

@router.get("/{quiz_id}/scores/count")
async def get_quiz_attempts(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(UserScore.id))
        .where(UserScore.quiz_id == quiz_id)
    )
    return {"attempts": result.scalar()}

@router.delete("/{quiz_id}")
async def delete_quiz_endpoint(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if quiz.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this quiz")

    success = await delete_quiz(db, quiz_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete quiz")
    return {"message": "Quiz deleted successfully"}
