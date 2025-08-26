from sqlalchemy import Column, Integer, String, JSON, ForeignKey, TIMESTAMP, Index, UniqueConstraint
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

class Friendship(Base):
    __tablename__ = "friendships"
    __table_args__ = (
        UniqueConstraint('requester_id', 'addressee_id', name='uq_friendship_unique_pair'),
        Index('ix_friendships_requester', 'requester_id'),
        Index('ix_friendships_addressee', 'addressee_id'),
    )

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default='pending')  # 'pending' | 'accepted' | 'declined'
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index('ix_notifications_user_id', 'user_id'),
        Index('ix_notifications_user_unread', 'user_id', 'is_read'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # recipient
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # initiator
    type = Column(String(50), nullable=False)  # e.g., 'friend_request', 'friend_accept', 'friend_decline'
    data = Column(JSON, nullable=True)
    is_read = Column(Integer, nullable=False, default=0)  # 0=false, 1=true (sqlite & pg compatible)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)