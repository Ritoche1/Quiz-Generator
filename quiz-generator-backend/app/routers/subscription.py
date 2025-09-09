from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from crud.user_crud import get_user_by_email, update_user_subscription
from app.routers.auth import get_current_user
from database.models import User
from pydantic import BaseModel
from typing import Optional
import stripe
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/subscription", tags=["subscription"])

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_PREMIUM_PRICE_ID = os.getenv("STRIPE_PREMIUM_PRICE_ID", "price_premium_monthly")

class CreateCheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

class SubscriptionResponse(BaseModel):
    subscription_type: str
    stripe_customer_id: Optional[str] = None
    subscription_ends_at: Optional[datetime] = None
    is_active: bool

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str

@router.get("/status", response_model=SubscriptionResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's subscription status."""
    is_active = current_user.subscription_type == 'premium'
    
    # Check if subscription is still active based on end date
    if current_user.subscription_ends_at:
        is_active = is_active and current_user.subscription_ends_at > datetime.now(timezone.utc)
    
    return SubscriptionResponse(
        subscription_type=current_user.subscription_type,
        stripe_customer_id=current_user.stripe_customer_id,
        subscription_ends_at=current_user.subscription_ends_at,
        is_active=is_active
    )

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Stripe checkout session for subscription upgrade."""
    
    try:
        # Create or retrieve Stripe customer
        if current_user.stripe_customer_id:
            customer = stripe.Customer.retrieve(current_user.stripe_customer_id)
        else:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={
                    "user_id": current_user.id,
                    "username": current_user.username
                }
            )
            # Update user with Stripe customer ID
            await update_user_subscription(
                db, 
                current_user.id, 
                stripe_customer_id=customer.id
            )
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': request.price_id,
                    'quantity': 1,
                }
            ],
            mode='subscription',
            success_url=request.success_url + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.cancel_url,
            metadata={
                "user_id": current_user.id
            }
        )
        
        return CheckoutSessionResponse(
            checkout_url=checkout_session.url,
            session_id=checkout_session.id
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/config")
async def get_subscription_config():
    """Get subscription configuration for frontend."""
    return {
        "publishable_key": STRIPE_PUBLISHABLE_KEY,
        "premium_price_id": STRIPE_PREMIUM_PRICE_ID,
        "plans": {
            "free": {
                "name": "Free",
                "price": 0,
                "quiz_generations_per_day": 5,
                "pdf_export": False,
                "premium_content": False,
                "features": [
                    "5 quiz generations per day",
                    "Basic browsing access",
                    "Standard quiz features"
                ]
            },
            "premium": {
                "name": "Premium",
                "price": 9.99,  # Monthly price in dollars
                "quiz_generations_per_day": 50,
                "pdf_export": True,
                "premium_content": True,
                "features": [
                    "50 quiz generations per day",
                    "Unlimited browsing access",
                    "Create custom quizzes",
                    "Export to PDF",
                    "Access premium content",
                    "Priority support"
                ]
            }
        }
    }

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel user's subscription."""
    
    if not current_user.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found"
        )
    
    try:
        # Cancel the subscription at period end
        stripe.Subscription.modify(
            current_user.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        return {"message": "Subscription will be cancelled at the end of the current period"}
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Stripe webhook events."""
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        await handle_checkout_session_completed(session, db)
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        await handle_subscription_updated(subscription, db)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        await handle_subscription_deleted(subscription, db)
    
    return {"received": True}

async def handle_checkout_session_completed(session, db: AsyncSession):
    """Handle completed checkout session."""
    user_id = int(session['metadata']['user_id'])
    customer_id = session['customer']
    subscription_id = session['subscription']
    
    # Retrieve subscription details from Stripe
    subscription = stripe.Subscription.retrieve(subscription_id)
    
    await update_user_subscription(
        db,
        user_id,
        subscription_type='premium',
        stripe_customer_id=customer_id,
        stripe_subscription_id=subscription_id,
        subscription_ends_at=datetime.fromtimestamp(
            subscription.current_period_end, 
            tz=timezone.utc
        )
    )

async def handle_subscription_updated(subscription, db: AsyncSession):
    """Handle subscription updates."""
    customer_id = subscription['customer']
    
    # Find user by customer ID
    user = await get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Update subscription end date
    await update_user_subscription(
        db,
        user.id,
        subscription_ends_at=datetime.fromtimestamp(
            subscription['current_period_end'],
            tz=timezone.utc
        )
    )

async def handle_subscription_deleted(subscription, db: AsyncSession):
    """Handle subscription cancellation."""
    customer_id = subscription['customer']
    
    # Find user by customer ID
    user = await get_user_by_stripe_customer_id(db, customer_id)
    if not user:
        return
    
    # Downgrade user to free
    await update_user_subscription(
        db,
        user.id,
        subscription_type='free',
        stripe_subscription_id=None,
        subscription_ends_at=None
    )