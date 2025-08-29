from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from crud.user_crud import get_user_by_email, get_user_by_username, create_user
from database.models import User
import os

router = APIRouter( prefix="/auth", tags=["auth"])

# Security configurations
SECRET_KEY = os.getenv("JWT_SECRET", "secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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

class UsernameUpdate(BaseModel):
    username: str

class EmailUpdate(BaseModel):
    email: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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
    
    # check if username already exists
    existing_username = await get_user_by_username(db, user.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    
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

@router.put("/update-username", response_model=UserResponse)
async def update_username(
    username_data: UsernameUpdate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Check if username is already taken by another user
    existing_user = await get_user_by_username(db, username_data.username)
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Update username
    current_user.username = username_data.username
    await db.commit()
    await db.refresh(current_user)
    
    return current_user

@router.put("/update-email", response_model=UserResponse)
async def update_email(
    email_data: EmailUpdate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Check if email is already taken by another user
    existing_user = await get_user_by_email(db, email_data.email)
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Update email
    current_user.email = email_data.email
    await db.commit()
    await db.refresh(current_user)
    
    return current_user

@router.put("/update-password")
async def update_password(
    password_data: PasswordUpdate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()
    
    return {"message": "Password updated successfully"}

@router.get("/export-data")
async def export_user_data(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get user's quiz history and scores
    from crud.score_crud import get_user_scores
    scores = await get_user_scores(db, current_user.id)
    
    # Prepare export data
    export_data = {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "export_date": datetime.utcnow().isoformat()
        },
        "quiz_history": [
            {
                "score_id": score.id,
                "quiz_id": score.quiz_id,
                "title": score.title,
                "score": score.score,
                "max_score": score.max_score,
                "difficulty": score.difficulty,
                "language": score.language,
                "date": score.date.isoformat() if score.date else None
            } for score in scores
        ],
        "statistics": {
            "total_quizzes": len(scores),
            "average_score": sum(s.score for s in scores) / len(scores) if scores else 0,
            "total_possible_score": sum(s.max_score for s in scores),
            "best_score": max(s.score for s in scores) if scores else 0
        }
    }
    
    return export_data