from sqlalchemy import Column, Integer, String, JSON, ForeignKey, TIMESTAMP, Index
from sqlalchemy.orm import relationship
from database.database import Base
from sqlalchemy.sql import func


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(String)
    language = Column(String(255))
    questions = Column(JSON)
    difficulty = Column(String(255))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Added owner field
    is_public = Column(Boolean, nullable=False, server_default='0')  # New: public flag for browsing
    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

class UserScore(Base):
    __tablename__ = "user_scores"
    __table_args__ = (
        Index('ix_user_scores_user_id', 'user_id'),
        Index('ix_user_scores_quiz_id', 'quiz_id'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    max_score = Column(Integer)
    answers = Column(JSON)
    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(255))
    hashed_password = Column(String(255))
    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    used_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )
    user = relationship("User", back_populates="reset_tokens")
