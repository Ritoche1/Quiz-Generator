import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from mistralai import Mistral

load_dotenv()

logger = logging.getLogger(__name__)


class MistralService:
    def __init__(self):
        self.client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))
        self.model = "mistral-large-latest"

    async def generate_quiz(self, topic: str, difficulty: str, language: str) -> dict:
        prompt = self._build_prompt(topic, difficulty, language)
        # Use asyncio.to_thread to avoid blocking the event loop
        # (the Mistral SDK's chat.complete is synchronous)
        response = await asyncio.to_thread(
            self.client.chat.complete,
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )
        return self._parse_response(response.choices[0].message.content)

    def _build_prompt(self, topic: str, difficulty: str, language: str) -> str:
        return (
            f"Generate a {difficulty} quiz on {topic} in {language} with 5 questions and 4 options each.\n\n"
            "Requirements:\n"
            f"- Questions should be accurate, clear, and appropriate for {difficulty} level\n"
            "- Each question must have exactly 4 options with only one correct answer\n"
            "- Ensure options are plausible and distinct from each other\n"
            "- Include a mix of question types (factual, conceptual, analytical)\n"
            "- Provide accurate answers for each question\n\n"
            "Return the questions and options in JSON format, wrapped in:\n"
            "```json\n"
            "{\n"
            '"quiz": {\n'
            '"questions": [\n'
            "{\n"
            '"question": "What is the capital of France?",\n'
            '"options": ["Berlin", "Madrid", "Paris", "Rome"],\n'
            '"answer": "Paris"\n'
            "},\n"
            "... 4 more questions ...\n"
            "]\n"
            "}\n"
            "}\n"
            "```"
        )

    def _parse_response(self, quiz_content: str) -> dict:
        try:
            json_str = quiz_content.split("```json")[1].split("```")[0].strip()
            return json.loads(json_str)
        except (IndexError, json.JSONDecodeError) as e:
            logger.error("Failed to parse Mistral response: %s", e)
            return {"error": "Failed to parse JSON response", "content": quiz_content}


mistral_service = MistralService()


async def generate_quiz_content(topic: str, difficulty: str, language: str) -> dict:
    return await mistral_service.generate_quiz(topic, difficulty, language)
