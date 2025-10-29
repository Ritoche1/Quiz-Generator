# Database Reset Instructions

## To enable the owner_id feature and show actual quiz creators instead of "Anonymous":

### Option 1: Reset Docker Volume (Recommended)
If you're using Docker, you can reset the database volume:

```bash
# Stop the containers
docker-compose down

# Remove the database volume (this will delete all data)
docker volume rm quiz-generator_postgres_data

# Start the containers again (this will create a fresh database with the new schema)
docker-compose up -d
```

### Option 2: Manual Database Migration (If using direct PostgreSQL/SQLite)
If you're not using Docker or want to keep existing data:

1. **Stop the backend application**

2. **Run the migration script:**
```bash
cd /home/antoine/Documents/Perso/Quiz-Generator/quiz-generator-backend
source venv/bin/activate  # if using virtual environment
python migrate_add_owner_column.py
```

3. **Start the backend application**

### What this enables:

1. **Quiz Creation**: New quizzes will have the creator's user ID stored in the `owner_id` field
2. **Browse Page**: The browse page will show the actual username of who created each quiz instead of "Anonymous"
3. **Future Features**: This sets up the foundation for features like:
   - "My Quizzes" filtering
   - Quiz editing permissions (only quiz creators can edit their quizzes)
   - Creator profiles and statistics

### After the reset:

1. You'll need to create a new user account (existing users will be gone if using Option 1)
2. Any quizzes you create will show your username as the creator
3. The browse page will display real creator names instead of mock data

## Note:
If you choose Option 1 (Docker volume reset), all existing data will be lost, but you'll have a clean database with the new schema. This is the easiest approach for development.
