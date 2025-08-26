#!/usr/bin/env python3
"""
Migration script to add owner_id column to quizzes table
"""
import asyncio
import os
import sys
from sqlalchemy import text
from database.database import get_db, engine

async def run_migration():
    """Add owner_id column to quizzes table"""
    
    # First check if column already exists
    try:
        async with engine.begin() as conn:
            # Check if column exists
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'quizzes' AND column_name = 'owner_id'
            """))
            
            if result.fetchone():
                print("Column owner_id already exists in quizzes table")
                return
            
            # Add the column
            await conn.execute(text("""
                ALTER TABLE quizzes 
                ADD COLUMN owner_id INTEGER,
                ADD FOREIGN KEY (owner_id) REFERENCES users(id)
            """))
            
            print("Successfully added owner_id column to quizzes table")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        # Try SQLite syntax instead
        try:
            async with engine.begin() as conn:
                await conn.execute(text("ALTER TABLE quizzes ADD COLUMN owner_id INTEGER"))
                print("Successfully added owner_id column to quizzes table (SQLite)")
        except Exception as sqlite_error:
            print(f"SQLite migration also failed: {sqlite_error}")
            raise

if __name__ == "__main__":
    asyncio.run(run_migration())