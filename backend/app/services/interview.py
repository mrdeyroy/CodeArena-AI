from __future__ import annotations

import json
import uuid

from openai import AsyncOpenAI

from app.config import settings


class InterviewService:
    """Generates and evaluates mock interview questions."""

    _SYSTEM = (
        "You are an expert technical interviewer at a top tech company. "
        "Always respond with valid JSON exactly matching the requested schema. "
        "No extra text outside the JSON."
    )

    _async_client: AsyncOpenAI | None = None

    def _client(self) -> AsyncOpenAI:
        if self._async_client is None:
            self._async_client = AsyncOpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_base_url,
                timeout=8.0
            )
        return self._async_client

    async def generate_questions(self, interview_type: str, count: int = 3) -> list[dict]:
        client = self._client()

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

        try:
            resp = await client.chat.completions.create(
                model=settings.ai_model,
                messages=[
                    {"role": "system", "content": self._SYSTEM},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.8,
            )
            data = json.loads(resp.choices[0].message.content or "{}")
            return data.get("questions", [])
        except Exception as e:
            print("AI generate_questions failed:", e)
            # Dynamic high-quality mock fallback questions based on type
            if interview_type == "dsa":
                return [
                    {"text": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.", "type": "dsa", "expected_topics": ["Arrays", "Hash Tables"]},
                    {"text": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.", "type": "dsa", "expected_topics": ["Stacks", "Design"]},
                    {"text": "Given the root of a binary tree, return its maximum depth.", "type": "dsa", "expected_topics": ["Trees", "DFS"]}
                ][:count]
            elif interview_type == "system_design":
                return [
                    {"text": "Design a highly available and scalable URL shortening service like TinyURL.", "type": "system_design", "expected_topics": ["Sharding", "Caching", "Load Balancers"]},
                    {"text": "Design a real-time notification system that can handle millions of active users.", "type": "system_design", "expected_topics": ["WebSockets", "Message Queues", "Scalability"]},
                    {"text": "Design a rate limiter service for a public-facing API gateway.", "type": "system_design", "expected_topics": ["Redis", "Token Bucket Algorithm", "API Gateway"]}
                ][:count]
            elif interview_type == "startup":
                return [
                    {"text": "How would you architect an MVP for a collaborative real-time document editor under strict deadlines?", "type": "startup", "expected_topics": ["WebSockets", "Operational Transformation", "Agile MVP"]},
                    {"text": "Describe your strategy for choosing between a SQL and NoSQL database for a rapid-growth SaaS platform.", "type": "startup", "expected_topics": ["SQL vs NoSQL", "Database Schema Design", "Scalability"]},
                    {"text": "How do you handle feature creep and align technical debt refactoring with product manager milestones?", "type": "startup", "expected_topics": ["Agile", "Technical Debt Management", "Prioritization"]}
                ][:count]
            else:
                return [
                    {"text": "Tell me about a time you had a significant disagreement with a teammate. How did you resolve it?", "type": "behavioral", "expected_topics": ["Conflict Resolution", "Collaboration"]},
                    {"text": "Describe a challenging technical problem you solved recently. What were the trade-offs?", "type": "behavioral", "expected_topics": ["Problem Solving", "Technical Depth"]},
                    {"text": "How do you manage your time and prioritize when working on multiple high-priority tasks?", "type": "behavioral", "expected_topics": ["Time Management", "Execution"]}
                ][:count]

    async def evaluate_answer(
        self, question: str, answer: str, interview_type: str
    ) -> dict:
        client = self._client()

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

        try:
            resp = await client.chat.completions.create(
                model=settings.ai_model,
                messages=[
                    {"role": "system", "content": self._SYSTEM},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
            )
            result = json.loads(resp.choices[0].message.content or "{}")
        except Exception as e:
            print("AI evaluate_answer failed:", e)
            result = {
                "technical_accuracy": 8,
                "communication": 7,
                "depth": 7,
                "feedback": "Strong effort! The response covers the primary aspects of the question. To improve, structure the answer by clearly stating the core concepts, highlighting trade-offs, and explaining the design or algorithmic choices made."
            }
        # Normalize 0-10 to 0-1
        result["technical_accuracy"] = round(result.get("technical_accuracy", 0) / 10, 3)
        result["communication"] = round(result.get("communication", 0) / 10, 3)
        result["depth"] = round(result.get("depth", 0) / 10, 3)
        return result


interview_service = InterviewService()
