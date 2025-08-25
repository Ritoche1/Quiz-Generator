from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.database import get_db
from database.models import User, Quiz, UserScore
from app.routers.auth import get_current_user
from crud.quiz_crud import *
from schemas.quiz import *

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.post("", response_model=QuizResponse, include_in_schema=False)
@router.post("/", response_model=QuizResponse)
async def create_new_quiz(quiz: QuizCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz_data = quiz.dict()
    quiz_data["questions"] = [q.dict() for q in quiz.questions]
    return await create_quiz(db, quiz_data)

@router.get("/", response_model=List[QuizResponse])
async def fetch_all_quizzes(db: AsyncSession = Depends(get_db)):
    return await get_all_quizzes(db)

@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_single_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

# Add to existing imports
from sqlalchemy import func

# Add these endpoints to the router
@router.get("/count")
async def get_quiz_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(Quiz.id)))
    return {"count": result.scalar()}

@router.get("/{quiz_id}/scores/count")
async def get_quiz_attempts(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(UserScore.id))
        .where(UserScore.quiz_id == quiz_id)
    )
    return {"attempts": result.scalar()}

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

@router.get("/stats/global")
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    """Get global platform statistics"""
    # Total quizzes
    quiz_count = await db.execute(select(func.count(Quiz.id)))
    total_quizzes = quiz_count.scalar()
    
    # Total users
    user_count = await db.execute(select(func.count(User.id)))
    total_users = user_count.scalar()
    
    # Average score
    score_avg = await db.execute(
        select(func.avg(UserScore.score / UserScore.max_score * 100))
    )
    avg_score = int(score_avg.scalar() or 0)
    
    # Most popular topic (most attempted quiz title)
    popular_topic = await db.execute(
        select(Quiz.title, func.count(UserScore.id).label('attempts'))
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
        "topicOfTheWeek": popular_topic_name
    }

# Browse quizzes with filtering
@router.get("/browse/public")
async def browse_public_quizzes(
    search: str = None,
    difficulty: str = None,
    language: str = None,
    sort_by: str = "created",
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Browse public quizzes with filtering and pagination"""
    query = select(Quiz).join(UserScore, Quiz.id == UserScore.quiz_id, isouter=True)
    
    # Apply filters
    if search:
        query = query.where(Quiz.title.ilike(f"%{search}%"))
    if difficulty and difficulty != "all":
        query = query.where(Quiz.difficulty == difficulty)
    if language and language != "all":
        query = query.where(Quiz.language == language)
    
    # Apply sorting
    if sort_by == "popular":
        query = query.group_by(Quiz.id).order_by(func.count(UserScore.id).desc())
    elif sort_by == "difficulty":
        query = query.order_by(Quiz.difficulty.asc())
    else:  # created (default)
        query = query.order_by(Quiz.created_at.desc())
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    quizzes = result.unique().scalars().all()
    
    # Enhance with statistics
    enhanced_quizzes = []
    for quiz in quizzes:
        # Get quiz stats
        stats_query = await db.execute(
            select(
                func.count(UserScore.id).label('attempts'),
                func.avg(UserScore.score / UserScore.max_score * 100).label('avg_score')
            )
            .where(UserScore.quiz_id == quiz.id)
        )
        stats = stats_query.first()
        
        # Get creator info (mock for now)
        enhanced_quizzes.append({
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "difficulty": quiz.difficulty,
            "language": quiz.language,
            "questionsCount": len(quiz.questions),
            "attempts": stats.attempts or 0,
            "avgScore": int(stats.avg_score or 0),
            "creator": "Anonymous",  # Could join with User table if we track creators
            "created": quiz.created_at,
            "tags": []  # Could be implemented as separate table
        })
    
    return enhanced_quizzes
