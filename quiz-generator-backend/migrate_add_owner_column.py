#!/usr/bin/env python3
"""
Migration script to add owner_id column to quizzes table
Run this script after stopping the application and before restarting it.
"""
import asyncio
import os
import sys
from sqlalchemy import text
from database.database import get_db, engine

async def run_migration():
    """Add owner_id column to quizzes table"""
    
    print("Starting migration: Adding owner_id column to quizzes table...")
    
    try:
        async with engine.begin() as conn:
            # Check if we're using PostgreSQL or SQLite
            db_url = os.getenv('DATABASE_URL', 'sqlite:///./test.db')
            is_postgres = db_url.startswith('postgresql')
            
            if is_postgres:
                print("Detected PostgreSQL database")
                
                # Check if column already exists (PostgreSQL)
                result = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'quizzes' AND column_name = 'owner_id'
                """))
                
                if result.fetchone():
                    print("Column owner_id already exists in quizzes table")
                    return
                
                # Add the column with foreign key constraint (PostgreSQL)
                await conn.execute(text("""
                    ALTER TABLE quizzes 
                    ADD COLUMN owner_id INTEGER,
                    ADD CONSTRAINT fk_quiz_owner 
                    FOREIGN KEY (owner_id) REFERENCES users(id)
                """))
                
            else:
                print("Detected SQLite database")
                
                # For SQLite, we need to check differently
                result = await conn.execute(text("PRAGMA table_info(quizzes)"))
                columns = result.fetchall()
                column_names = [col[1] for col in columns]
                
                if 'owner_id' in column_names:
                    print("Column owner_id already exists in quizzes table")
                    return
                
                # Add the column (SQLite doesn't support adding foreign keys to existing tables)
                await conn.execute(text("ALTER TABLE quizzes ADD COLUMN owner_id INTEGER"))
            
            print("Successfully added owner_id column to quizzes table")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_migration())
