import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import MissingBackendError
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.database import get_db
from crud.user_crud import (
    create_password_reset_token,
    create_user,
    get_password_reset_token,
    get_user_by_email,
    get_user_by_id,
    invalidate_user_reset_tokens,
    update_user_password,
)
from app.services.email_service import send_password_reset_email
from database.models import User, Quiz, UserScore, Friendship, Notification, Generation
import os
import secrets

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Security configurations
SECRET_KEY = os.getenv("JWT_SECRET", "")
if not SECRET_KEY:
    logger.warning("JWT_SECRET not set — generating a random key. Set JWT_SECRET in production!")
    SECRET_KEY = secrets.token_urlsafe(64)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(
    schemes=["bcrypt_sha256", "bcrypt"],
    deprecated=["bcrypt"],
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str
    username: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, MissingBackendError):
        return False


def get_password_hash(password):
    try:
        return pwd_context.hash(password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long; please use 72 characters or fewer.",
        ) from exc
    except MissingBackendError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hashing backend unavailable; try again later.",
        ) from exc


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    response_message = "If the account exists, password reset instructions have been sent."
    user = await get_user_by_email(db, payload.email)
    if not user:
        return ForgotPasswordResponse(message=response_message)

    user_email = user.email

    try:
        await invalidate_user_reset_tokens(db, user.id)

        token = secrets.token_urlsafe(32)
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).replace(tzinfo=None)
        reset_token = await create_password_reset_token(db, user.id, token, expires_at)
        await db.commit()
        await db.refresh(reset_token)
    except Exception:
        await db.rollback()
        logger.exception("Failed to create password reset token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process password reset request. Please try again later.",
        )

    email_sent = await send_password_reset_email(user_email, reset_token.token)
    if not email_sent:
        logger.warning("Password reset email could not be delivered.")

    return ForgotPasswordResponse(message=response_message)


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    reset_token = await get_password_reset_token(db, payload.token)
    if not reset_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    if reset_token.used_at is not None or reset_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    user = await get_user_by_id(db, reset_token.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found for this token.")

    try:
        hashed_password = get_password_hash(payload.password)
        await update_user_password(db, user, hashed_password)

        reset_token.used_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Failed to reset password")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reset password. Please try again later.")

    return {"message": "Password updated successfully."}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)

    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        username=user.username,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_user_me(update: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if update.username is not None:
        if len(update.username.strip()) < 2:
            raise HTTPException(status_code=400, detail="Username must be at least 2 characters")
        current_user.username = update.username.strip()
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    current_user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

async def _save_upload(file: UploadFile, folder: str, user_id: int) -> str:
    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images are allowed")
    content = await file.read()
    if len(content) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large — maximum 5 MB")
    ext = (file.filename or "image").rsplit(".", 1)[-1].lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        ext = "jpg"
    dir_path = f"/app/uploads/{folder}"
    os.makedirs(dir_path, exist_ok=True)
    # Remove any previous uploads for this user in this folder
    for existing in os.listdir(dir_path):
        if existing.startswith(f"{user_id}."):
            os.remove(os.path.join(dir_path, existing))
    filename = f"{user_id}.{ext}"
    with open(os.path.join(dir_path, filename), "wb") as f:
        f.write(content)
    return f"/uploads/{folder}/{filename}"

@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    url = await _save_upload(file, "avatars", current_user.id)
    current_user.avatar_url = url
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/me/cover", response_model=UserResponse)
async def upload_cover(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    url = await _save_upload(file, "covers", current_user.id)
    current_user.cover_url = url
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.delete("/delete-account")
async def delete_account(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import delete as sql_delete, or_
    # Delete scores by other users on quizzes owned by this user
    user_quiz_ids = (await db.execute(select(Quiz.id).where(Quiz.owner_id == current_user.id))).scalars().all()
    if user_quiz_ids:
        await db.execute(sql_delete(UserScore).where(UserScore.quiz_id.in_(user_quiz_ids)))
    # Delete all related data
    await db.execute(sql_delete(UserScore).where(UserScore.user_id == current_user.id))
    await db.execute(sql_delete(Notification).where(or_(Notification.user_id == current_user.id, Notification.actor_user_id == current_user.id)))
    await db.execute(sql_delete(Friendship).where(or_(Friendship.requester_id == current_user.id, Friendship.addressee_id == current_user.id)))
    await db.execute(sql_delete(Generation).where(Generation.user_id == current_user.id))
    # Delete quizzes owned by user
    await db.execute(sql_delete(Quiz).where(Quiz.owner_id == current_user.id))
    # Delete user (cascades to reset tokens)
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted successfully"}
