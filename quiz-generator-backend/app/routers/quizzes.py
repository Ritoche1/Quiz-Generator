from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.database import get_db
from database.models import User, Quiz, UserScore
from app.routers.auth import get_current_user
from app.services.subscription_service import subscription_service
from crud.quiz_crud import *
from schemas.quiz import *
import logging

router = APIRouter(prefix="/quizzes", tags=["quizzes"])
logger = logging.getLogger(__name__)

@router.post("", response_model=QuizResponse, include_in_schema=False)
@router.post("/", response_model=QuizResponse)
async def create_new_quiz(quiz: QuizCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz_data = quiz.dict()
    quiz_data["questions"] = [q.dict() for q in quiz.questions]
    # Ensure owner_id is set so creator shows up in browse/profile
    quiz_data["owner_id"] = current_user.id
    # Honor provided is_public or default False from schema/DB; do not force True
    return await create_quiz(db, quiz_data)

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

@router.get("/", response_model=List[QuizResponse])
async def fetch_all_quizzes(db: AsyncSession = Depends(get_db)):
    return await get_all_quizzes(db)

@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_single_quiz(
    quiz_id: int, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a single quiz, checking subscription access for premium content."""
    quiz = await get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if user can access this quiz
    can_access = await subscription_service.can_access_quiz(current_user, quiz)
    if not can_access:
        raise HTTPException(
            status_code=403, 
            detail={
                "error": "Premium content access required",
                "message": "This quiz is premium content. Upgrade to Premium to access it.",
                "premium_required": True
            }
        )
    
    return quiz

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Browse public quizzes with filtering and pagination. Premium content filtered by subscription."""
    
    # Check user's subscription status for premium content filtering
    subscription_status = await subscription_service.check_user_subscription_status(current_user)
    can_access_premium = subscription_status['can_access_premium_content']
    
    # Select explicit quiz columns and left join user to get creator username
    query = select(
        Quiz.id.label('quiz_id'),  # Explicitly label the quiz ID
        Quiz.title.label('title'),
        Quiz.description.label('description'),
        Quiz.language.label('language'),
        Quiz.questions.label('questions'),
        Quiz.difficulty.label('difficulty'),
        Quiz.owner_id.label('owner_id'),
        Quiz.is_public.label('is_public'),
        Quiz.is_premium.label('is_premium'),  # Include premium flag
        Quiz.created_at.label('created_at'),
        User.username.label('username')
    ).join(User, Quiz.owner_id == User.id, isouter=True)

    # Only public quizzes
    query = query.where(Quiz.is_public == True)
    
    # Filter premium content for free users
    if not can_access_premium:
        query = query.where(Quiz.is_premium == False)

    # Apply filters
    if search:
        il = f"%{search}%"
        query = query.where(
            (Quiz.title.ilike(il)) |
            (Quiz.description.ilike(il))
        )
    if difficulty and difficulty != "all":
        query = query.where(Quiz.difficulty == difficulty)
    if language and language != "all":
        query = query.where(Quiz.language == language)

    # Apply sorting
    if sort_by == "popular":
        # Use a subquery to compute attempt counts per quiz and order by that
        attempts_subq = (
            select(UserScore.quiz_id.label('quiz_id'), func.count(UserScore.id).label('attempts'))
            .group_by(UserScore.quiz_id)
        ).subquery()
        query = query.outerjoin(attempts_subq, Quiz.id == attempts_subq.c.quiz_id).order_by(attempts_subq.c.attempts.desc().nullslast())
    elif sort_by == "difficulty":
        query = query.order_by(Quiz.difficulty.asc())
    else:  # created (default)
        query = query.order_by(Quiz.created_at.desc())

    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    # Use mappings() so we get dict-like rows and can access columns consistently
    quiz_rows = result.mappings().all()

    # Enhance with statistics
    enhanced_quizzes = []
    for row in quiz_rows:
        quiz_id = row.get("quiz_id")  # Use the correct label
        creator_name = row.get("username") or "Anonymous"
        questions = row.get("questions") or []
        is_premium = bool(row.get("is_premium"))

        stats_query = await db.execute(
            select(
                func.count(UserScore.id).label("attempts"),
                func.avg(UserScore.score / UserScore.max_score * 100).label("avg_score"),
            ).where(UserScore.quiz_id == quiz_id)
        )
        stats = stats_query.mappings().first() or {}
        attempts = int(stats.get("attempts") or 0)
        avg_score = int(stats.get("avg_score") or 0)

        enhanced_quizzes.append({
            "id": quiz_id,
            "title": row.get("title"),
            "description": row.get("description"),
            "difficulty": row.get("difficulty"),
            "language": row.get("language"),
            "questionsCount": len(questions),
            "attempts": attempts,
            "avgScore": avg_score,
            "creator": creator_name,
            "created": row.get("created_at"),
            "tags": [],
            "is_public": bool(row.get("is_public")),
            "is_premium": is_premium,
            "premium_badge": is_premium and not can_access_premium  # Show premium badge for inaccessible content
        })

    return {
        "quizzes": enhanced_quizzes,
        "pagination": {
            "page": page,
            "limit": limit,
            "has_more": len(enhanced_quizzes) == limit  # Simple check for more pages
        },
        "user_subscription": {
            "type": subscription_status['subscription_type'],
            "can_access_premium": can_access_premium
        }
    }

@router.delete("/{quiz_id}")
async def delete_quiz_endpoint(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
