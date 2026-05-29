import httpx

from app.config import settings
from app.schemas.schemas import ExecuteRequest, ExecuteResponse, SubmissionStatus, Language

PISTON_LANGUAGE_MAP = {
    Language.PYTHON: ("python", "3.10.0"),
    Language.CPP: ("cpp", "10.2.0"),
    Language.JAVA: ("java", "15.0.2"),
}

STATUS_MAP = {
    "accepted": SubmissionStatus.ACCEPTED,
    "wrong_answer": SubmissionStatus.WRONG_ANSWER,
    "time_limit_exceeded": SubmissionStatus.TIME_LIMIT_EXCEEDED,
    "memory_limit_exceeded": SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
    "runtime_error": SubmissionStatus.RUNTIME_ERROR,
    "compile_error": SubmissionStatus.COMPILE_ERROR,
    "processing": SubmissionStatus.PROCESSING,
}


class PistonService:
    def __init__(self):
        self.base_url = settings.piston_api_url.rstrip("/")

    async def execute(self, request: ExecuteRequest) -> ExecuteResponse:
        lang, version = PISTON_LANGUAGE_MAP.get(request.language, ("python", "3.10.0"))

        body = {
            "language": lang,
            "version": version,
            "files": [{"name": "main", "content": request.code}],
            "stdin": request.stdin or "",
            "run_timeout": 30000,
            "compile_timeout": 30000,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/execute",
                json=body,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            result = resp.json()

        run = result.get("run", {})
        compile_output = result.get("compile", {})
        exit_code = run.get("code", -1)

        if compile_output.get("code", 0) != 0:
            status = SubmissionStatus.COMPILE_ERROR
        elif exit_code == 124:
            status = SubmissionStatus.TIME_LIMIT_EXCEEDED
        elif exit_code == 137:
            status = SubmissionStatus.MEMORY_LIMIT_EXCEEDED
        elif exit_code != 0:
            status = SubmissionStatus.RUNTIME_ERROR
        else:
            status = SubmissionStatus.ACCEPTED

        return ExecuteResponse(
            status=status,
            stdout=run.get("output") or (run.get("stdout", "").strip() or None),
            stderr=run.get("stderr", "").strip() or None,
            runtime=run.get("wall_time"),
            memory=run.get("memory"),
        )
