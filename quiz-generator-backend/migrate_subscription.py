#!/usr/bin/env python3
"""
Migration script to add subscription functionality to the Quiz Generator database.
This script adds subscription fields to the users table and is_premium flag to quizzes.
"""

import asyncio
import os
from sqlalchemy import text
from database.database import engine, Base, get_db
from database.models import User, Quiz
from sqlalchemy.ext.asyncio import AsyncSession

async def add_subscription_columns():
    """Add subscription-related columns to users and quizzes tables."""
    
    async with engine.begin() as conn:
        print("Starting subscription migration...")
        
        # Add subscription columns to users table
        user_migration_queries = [
            """
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) NOT NULL DEFAULT 'free'
            """,
            """
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
            """,
            """
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)
            """,
            """
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP
            """
        ]
        
        # Add premium flag to quizzes table
        quiz_migration_queries = [
            """
            ALTER TABLE quizzes 
            ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE
            """
        ]
        
        try:
            # Execute user table migrations
            for query in user_migration_queries:
                await conn.execute(text(query))
                print(f"✅ Executed: {query.strip()}")
            
            # Execute quiz table migrations  
            for query in quiz_migration_queries:
                await conn.execute(text(query))
                print(f"✅ Executed: {query.strip()}")
            
            print("🎉 Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

async def verify_migration():
    """Verify that the migration was successful."""
    async with engine.begin() as conn:
        print("\nVerifying migration...")
        
        # Check users table columns
        result = await conn.execute(text("""
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('subscription_type', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_ends_at')
            ORDER BY column_name
        """))
        
        user_columns = result.fetchall()
        print("📋 Users table new columns:")
        for col in user_columns:
            print(f"  - {col[0]}: {col[1]} (default: {col[2]})")
        
        # Check quizzes table columns
        result = await conn.execute(text("""
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'quizzes' 
            AND column_name = 'is_premium'
        """))
        
        quiz_columns = result.fetchall()
        print("📋 Quizzes table new columns:")
        for col in quiz_columns:
            print(f"  - {col[0]}: {col[1]} (default: {col[2]})")
        
        if len(user_columns) == 4 and len(quiz_columns) == 1:
            print("✅ Migration verification passed!")
        else:
            print("❌ Migration verification failed!")

async def main():
    """Main migration function."""
    print("🚀 Starting Quiz Generator subscription migration")
    print("=" * 50)
    
    try:
        await add_subscription_columns()
        await verify_migration()
        
    except Exception as e:
        print(f"💥 Migration failed with error: {e}")
        exit(1)
    
    print("=" * 50)
    print("🏁 Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())