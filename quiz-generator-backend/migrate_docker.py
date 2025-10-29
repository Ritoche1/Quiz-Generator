#!/usr/bin/env python3
"""
Docker-compatible migration script to add owner_id column to quizzes table
Run this inside the Docker container or with proper DATABASE_URL
"""
import asyncio
import os
import sys
from sqlalchemy import text, create_engine
from sqlalchemy.ext.asyncio import create_async_engine

async def run_docker_migration():
    """Add owner_id column to quizzes table in PostgreSQL"""
    
    # Get database URL from environment (Docker environment)
    database_url = os.getenv('DATABASE_URL', 'postgresql://quizuser:quizpass@postgres:5432/quizdb')
    
    # Convert to async URL if needed
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://')
    
    print(f"Starting migration for database: {database_url.split('@')[1] if '@' in database_url else 'localhost'}")
    
    try:
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            print("Connected to PostgreSQL database")
            
            # Check if column already exists
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'quizzes' AND column_name = 'owner_id'
            """))
            
            if result.fetchone():
                print("✅ Column owner_id already exists in quizzes table")
                return
            
            # Add the column with foreign key constraint
            print("Adding owner_id column...")
            await conn.execute(text("""
                ALTER TABLE quizzes 
                ADD COLUMN owner_id INTEGER
            """))
            
            # Add foreign key constraint
            print("Adding foreign key constraint...")
            await conn.execute(text("""
                ALTER TABLE quizzes 
                ADD CONSTRAINT fk_quiz_owner 
                FOREIGN KEY (owner_id) REFERENCES users(id)
            """))
            
            print("✅ Successfully added owner_id column to quizzes table")
            
        await engine.dispose()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_docker_migration())
