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
        
        # Check if we're using PostgreSQL or SQLite
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        is_sqlite = bool(result.fetchall())
        
        if is_sqlite:
            print("Detected SQLite database")
            # SQLite migration queries
            user_migration_queries = [
                "ALTER TABLE users ADD COLUMN subscription_type VARCHAR(20) DEFAULT 'free'",
                "ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255)",
                "ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255)", 
                "ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP"
            ]
            
            quiz_migration_queries = [
                "ALTER TABLE quizzes ADD COLUMN is_premium BOOLEAN DEFAULT FALSE"
            ]
        else:
            print("Detected PostgreSQL database")
            # PostgreSQL migration queries
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
            
            quiz_migration_queries = [
                """
                ALTER TABLE quizzes 
                ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE
                """
            ]
        
        try:
            # Execute user table migrations
            for query in user_migration_queries:
                try:
                    await conn.execute(text(query))
                    print(f"✅ Executed: {query.strip()}")
                except Exception as e:
                    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                        print(f"⚠️  Column already exists, skipping: {query.strip()}")
                    else:
                        raise e
            
            # Execute quiz table migrations  
            for query in quiz_migration_queries:
                try:
                    await conn.execute(text(query))
                    print(f"✅ Executed: {query.strip()}")
                except Exception as e:
                    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                        print(f"⚠️  Column already exists, skipping: {query.strip()}")
                    else:
                        raise e
            
            print("🎉 Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

async def verify_migration():
    """Verify that the migration was successful."""
    async with engine.begin() as conn:
        print("\nVerifying migration...")
        
        # Check if we're using PostgreSQL or SQLite
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        is_sqlite = bool(result.fetchall())
        
        if is_sqlite:
            # SQLite verification
            result = await conn.execute(text("PRAGMA table_info(users)"))
            user_columns = [row[1] for row in result.fetchall()]
            
            result = await conn.execute(text("PRAGMA table_info(quizzes)"))
            quiz_columns = [row[1] for row in result.fetchall()]
        else:
            # PostgreSQL verification
            result = await conn.execute(text("""
                SELECT column_name, data_type, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('subscription_type', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_ends_at')
                ORDER BY column_name
            """))
            
            user_columns = [row[0] for row in result.fetchall()]
            
            result = await conn.execute(text("""
                SELECT column_name, data_type, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'quizzes' 
                AND column_name = 'is_premium'
            """))
            
            quiz_columns = [row[0] for row in result.fetchall()]
        
        expected_user_cols = ['subscription_type', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_ends_at']
        expected_quiz_cols = ['is_premium']
        
        print("📋 Users table new columns:")
        for col in expected_user_cols:
            if col in user_columns:
                print(f"  ✅ {col}")
            else:
                print(f"  ❌ {col} (missing)")
        
        print("📋 Quizzes table new columns:")
        for col in expected_quiz_cols:
            if col in quiz_columns:
                print(f"  ✅ {col}")
            else:
                print(f"  ❌ {col} (missing)")
        
        missing_user_cols = [col for col in expected_user_cols if col not in user_columns]
        missing_quiz_cols = [col for col in expected_quiz_cols if col not in quiz_columns]
        
        if not missing_user_cols and not missing_quiz_cols:
            print("✅ Migration verification passed!")
        else:
            print("❌ Migration verification failed!")
            if missing_user_cols:
                print(f"   Missing user columns: {missing_user_cols}")
            if missing_quiz_cols:
                print(f"   Missing quiz columns: {missing_quiz_cols}")

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