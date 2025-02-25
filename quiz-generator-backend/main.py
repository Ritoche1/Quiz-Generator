from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mistralai import Mistral
import os
import json

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:83", "http://ritoche.site", "https://ritoche.site", "https://www.ritoche.site"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


api_key =  os.getenv('MISTRAL_API_KEY')
if not api_key:
    raise ValueError("MISTRAL_API_KEY environment variable is not set")
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

class QuizRequest(BaseModel):
    topic: str
    difficulty: str

@app.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    try:
        # Define the prompt for Mistral
        prompt = (
            f"Generate a {request.difficulty} quiz on {request.topic} with 5 questions and 4 options each and the answer must be here. "
            'Return the questions and options in JSON format, wrapped in ```json { "quiz": { "questions": [{"question": "What is the capital of France?","options": ["Berlin", "Madrid", "Paris", "Rome"],"answer": "Paris"}]}} ```.'
        )

        # Call Mistral's API
        chat_response = client.chat.complete(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )

        # Extract the response content
        quiz_content = chat_response.choices[0].message.content
        # # Check if the response contains the expected JSON format
        # json_str = quiz_content.split("```json")[1].split("```")[0].strip()

        try:
            quiz_data = parseJSON(quiz_content)
            return quiz_data
        except:
            raise HTTPException(status_code=500, detail="Failed to generate quiz: Invalid response format : " + json_str)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

def parseJSON(quiz_content):
    try:
        # Extract the JSON part from the response (assuming it's wrapped in ```json ... ```)
        json_str = quiz_content.split("```json")[1].split("```")[0].strip()
        # Parse the JSON string into a Python dictionary
        quiz_data = json.loads(json_str)
        return quiz_data
    except (IndexError, json.JSONDecodeError) as e:
        # If parsing fails, return an error or fallback response
        return {"error": "Failed to parse JSON response", "content": quiz_content}


@app.get("/ping")
async def ping():
    return {"ping": "pong"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
