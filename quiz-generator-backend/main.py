from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import quizzes, scores, generator
from database.database import engine, Base
from database import models
from database.database import engine

app = FastAPI()

@app.on_event("startup")
async def startup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:83", "http://ritoche.site", "https://ritoche.site", "https://www.ritoche.site"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(generator.router)
app.include_router(quizzes.router)
app.include_router(scores.router)


@app.get("/ping")
async def ping():
    return {"ping": "pong"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
