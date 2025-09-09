from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from database.models import User, Generation, Quiz
from typing import Dict, Any
from fastapi import HTTPException, status

class SubscriptionService:
    """Service to handle subscription-related business logic."""
    
    # Subscription limits
    FREE_DAILY_LIMIT = 5
    PREMIUM_DAILY_LIMIT = 50
    
    def __init__(self):
        pass
    
    async def check_user_subscription_status(self, user: User) -> Dict[str, Any]:
        """Check if user's subscription is active and return status info."""
        
        is_premium = user.subscription_type == 'premium'
        is_active = is_premium
        
        # Check if premium subscription is still valid based on end date
        if is_premium and user.subscription_ends_at:
            is_active = user.subscription_ends_at > datetime.now(timezone.utc)
            
            # If subscription expired, downgrade to free (this should normally be handled by webhooks)
            if not is_active:
                is_premium = False
        
        return {
            'is_premium': is_premium,
            'is_active': is_active,
            'subscription_type': 'premium' if is_active else 'free',
            'daily_limit': self.PREMIUM_DAILY_LIMIT if is_active else self.FREE_DAILY_LIMIT,
            'can_export_pdf': is_active,
            'can_access_premium_content': is_active,
            'subscription_ends_at': user.subscription_ends_at if is_active else None
        }
    
    async def check_daily_generation_limit(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        """Check user's daily quiz generation usage and limits."""
        
        subscription_status = await self.check_user_subscription_status(user)
        daily_limit = subscription_status['daily_limit']
        
        # Get today's generation count
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        result = await db.execute(
            select(func.count(Generation.id))
            .where(
                and_(
                    Generation.user_id == user.id,
                    Generation.created_at >= today_start,
                    Generation.created_at < today_end
                )
            )
        )
        
        today_count = result.scalar() or 0
        remaining = max(0, daily_limit - today_count)
        
        return {
            'used': today_count,
            'limit': daily_limit,
            'remaining': remaining,
            'can_generate': remaining > 0,
            'subscription_type': subscription_status['subscription_type']
        }
    
    async def validate_generation_limit(self, db: AsyncSession, user: User) -> None:
        """Validate if user can generate a quiz, raise exception if not."""
        
        usage = await self.check_daily_generation_limit(db, user)
        
        if not usage['can_generate']:
            subscription_status = await self.check_user_subscription_status(user)
            if subscription_status['is_premium']:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Daily limit of {usage['limit']} quiz generations reached. Please try again tomorrow."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "error": "Daily limit reached",
                        "message": f"You've reached your daily limit of {usage['limit']} quiz generations. Upgrade to Premium for {self.PREMIUM_DAILY_LIMIT} generations per day.",
                        "used": usage['used'],
                        "limit": usage['limit'],
                        "upgrade_required": True
                    }
                )
    
    async def record_generation(self, db: AsyncSession, user_id: int) -> None:
        """Record a quiz generation for the user."""
        generation = Generation(user_id=user_id)
        db.add(generation)
        await db.commit()
    
    async def can_access_quiz(self, user: User, quiz: Quiz) -> bool:
        """Check if user can access a specific quiz based on subscription."""
        
        # Public non-premium quizzes are accessible to everyone
        if quiz.is_public and not quiz.is_premium:
            return True
        
        # Premium content requires premium subscription
        if quiz.is_premium:
            subscription_status = await self.check_user_subscription_status(user)
            return subscription_status['can_access_premium_content']
        
        # Private quizzes are only accessible to their owners
        if not quiz.is_public:
            return quiz.owner_id == user.id
        
        return True
    
    async def can_export_pdf(self, user: User) -> bool:
        """Check if user can export PDFs."""
        subscription_status = await self.check_user_subscription_status(user)
        return subscription_status['can_export_pdf']
    
    async def filter_accessible_quizzes(self, user: User, quizzes: list) -> list:
        """Filter quizzes based on user subscription and permissions."""
        accessible_quizzes = []
        
        for quiz in quizzes:
            if await self.can_access_quiz(user, quiz):
                accessible_quizzes.append(quiz)
        
        return accessible_quizzes
    
    async def get_subscription_limits_info(self, user: User) -> Dict[str, Any]:
        """Get comprehensive subscription limits information for the user."""
        subscription_status = await self.check_user_subscription_status(user)
        
        return {
            'subscription_type': subscription_status['subscription_type'],
            'is_premium': subscription_status['is_premium'],
            'daily_generation_limit': subscription_status['daily_limit'],
            'can_export_pdf': subscription_status['can_export_pdf'],
            'can_access_premium_content': subscription_status['can_access_premium_content'],
            'subscription_ends_at': subscription_status['subscription_ends_at'],
            'features': {
                'quiz_generation': {
                    'daily_limit': subscription_status['daily_limit'],
                    'unlimited_browsing': subscription_status['is_premium']
                },
                'pdf_export': subscription_status['can_export_pdf'],
                'premium_content': subscription_status['can_access_premium_content'],
                'custom_quizzes': True,  # All users can create custom quizzes
                'priority_support': subscription_status['is_premium']
            }
        }

# Global instance
subscription_service = SubscriptionService()