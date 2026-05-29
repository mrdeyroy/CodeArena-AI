from __future__ import annotations

import json
import uuid

from openai import OpenAI

from app.config import settings


class InterviewService:
    """Generates and evaluates mock interview questions."""

    _SYSTEM = (
        "You are an expert technical interviewer at a top tech company. "
        "Always respond with valid JSON exactly matching the requested schema. "
        "No extra text outside the JSON."
    )

    async def generate_questions(self, interview_type: str, count: int = 3) -> list[dict]:
        client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

        prompts = {
            "dsa": "Generate DSA coding interview questions. Include problem statement, constraints, and expected complexity.",
            "startup": "Generate startup-style technical interview questions covering full-stack, scalability, and MVPs.",
            "behavioral": "Generate behavioral interview questions covering leadership, conflict, and teamwork.",
            "system_design": "Generate system design interview questions covering architecture, scaling, and trade-offs.",
        }

        type_prompt = prompts.get(interview_type, prompts["dsa"])

        prompt = (
            f"Generate {count} {interview_type} interview questions.\n"
            f"{type_prompt}\n"
            f'Respond in JSON: {{"questions": [{{"text": "question", "type": "{interview_type}", "expected_topics": ["topic1", "topic2"]}}]}}'
        )

        resp = client.chat.completions.create(
            model=settings.ai_model,
            messages=[
                {"role": "system", "content": self._SYSTEM},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        return data.get("questions", [])

    async def evaluate_answer(
        self, question: str, answer: str, interview_type: str
    ) -> dict:
        client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

        prompt = (
            f"Interview type: {interview_type}\n"
            f"Question: {question}\n"
            f"Candidate's answer: {answer}\n\n"
            "Evaluate the answer on:\n"
            "- Technical accuracy (0-10)\n"
            "- Communication clarity (0-10)\n"
            "- Depth of knowledge (0-10)\n"
            "- Constructive feedback\n\n"
            'Respond in JSON: {"technical_accuracy": 0, "communication": 0, "depth": 0, "feedback": "..."}'
        )

        resp = client.chat.completions.create(
            model=settings.ai_model,
            messages=[
                {"role": "system", "content": self._SYSTEM},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )
        result = json.loads(resp.choices[0].message.content or "{}")
        # Normalize 0-10 to 0-1
        result["technical_accuracy"] = round(result.get("technical_accuracy", 0) / 10, 3)
        result["communication"] = round(result.get("communication", 0) / 10, 3)
        result["depth"] = round(result.get("depth", 0) / 10, 3)
        return result


interview_service = InterviewService()
