from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import MissingBackendError
from pydantic import BaseModel, EmailStr
from typing import Optional
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
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
from database.models import User
import os
import secrets

router = APIRouter( prefix="/auth", tags=["auth"])

# Security configurations
SECRET_KEY = os.getenv("JWT_SECRET", "secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(
    schemes=["bcrypt_sha256", "bcrypt"],
    deprecated=["bcrypt"],
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None
    notice: Optional[str] = None

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
    user = await get_user_by_email(db, payload.email)
    if not user:
        return ForgotPasswordResponse(message="If the account exists, password reset instructions have been sent.")

    user_email = user.email

    try:
        await invalidate_user_reset_tokens(db, user.id)

        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        reset_token = await create_password_reset_token(db, user.id, token, expires_at)
        await db.commit()
        await db.refresh(reset_token)
    except Exception:
        await db.rollback()
        raise

    email_sent = await send_password_reset_email(user_email, reset_token.token)

    payload = {
        "message": "Password reset instructions generated successfully."
    }

    if not email_sent:
        payload["notice"] = "Email delivery not configured; use the token shown below to reset manually."
        payload["reset_token"] = reset_token.token

    return ForgotPasswordResponse(**payload)


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    reset_token = await get_password_reset_token(db, payload.token)
    if not reset_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    if reset_token.used_at is not None or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    user = await get_user_by_id(db, reset_token.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found for this token.")

    try:
        hashed_password = get_password_hash(payload.password)
        await update_user_password(db, user, hashed_password)

        reset_token.used_at = datetime.utcnow()
        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reset password. Please try again later.")

    return {"message": "Password updated successfully."}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
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

    # check if user already exists
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    
    # create user in database
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        username=user.username
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # get user access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):

    # check if user exists and password is correct
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # get user access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user