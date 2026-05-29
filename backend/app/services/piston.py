import asyncio
import tempfile
import time
from pathlib import Path
import os
import shutil

from app.config import settings
from app.schemas.schemas import ExecuteRequest, ExecuteResponse, SubmissionStatus, Language

class PistonService:
    def __init__(self):
        self.base_url = settings.piston_api_url.rstrip("/")

    async def execute(self, request: ExecuteRequest) -> ExecuteResponse:
        # Normalize language identifier
        lang = str(request.language).lower()

        # Create temporary directory for isolated execution
        temp_dir = Path(tempfile.mkdtemp(prefix="codearena_"))
        try:
            if "python" in lang:
                code_file = temp_dir / "solution.py"
                code_file.write_text(request.code, encoding="utf-8")
                
                start_time = time.perf_counter()
                proc = await asyncio.create_subprocess_exec(
                    "python3",
                    str(code_file),
                    stdin=asyncio.subprocess.PIPE,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                
                try:
                    stdout, stderr = await asyncio.wait_for(
                        proc.communicate(input=(request.stdin or "").encode("utf-8")),
                        timeout=5.0
                    )
                    runtime = time.perf_counter() - start_time
                    exit_code = proc.returncode
                except asyncio.TimeoutError:
                    try:
                        proc.kill()
                    except Exception:
                        pass
                    return ExecuteResponse(
                        status=SubmissionStatus.TIME_LIMIT_EXCEEDED,
                        stdout=None,
                        stderr="Execution timed out (5.0s limit reached).",
                        runtime=5.0,
                        memory=0,
                    )
                
                decoded_stdout = stdout.decode("utf-8", errors="replace")
                decoded_stderr = stderr.decode("utf-8", errors="replace")
                
                if exit_code != 0:
                    return ExecuteResponse(
                        status=SubmissionStatus.RUNTIME_ERROR,
                        stdout=decoded_stdout or None,
                        stderr=decoded_stderr or f"Exit code {exit_code}",
                        runtime=runtime,
                        memory=0,
                    )
                
                return ExecuteResponse(
                    status=SubmissionStatus.ACCEPTED,
                    stdout=decoded_stdout,
                    stderr=decoded_stderr or None,
                    runtime=runtime,
                    memory=0,
                )

            elif "cpp" in lang or "c++" in lang:
                # Compile step
                cpp_file = temp_dir / "solution.cpp"
                cpp_file.write_text(request.code, encoding="utf-8")
                exec_file = temp_dir / "solution_bin"
                
                # Check for g++
                gpp_path = shutil.which("g++")
                if not gpp_path:
                    return ExecuteResponse(
                        status=SubmissionStatus.COMPILE_ERROR,
                        stdout=None,
                        stderr="g++ compiler is not available on the server.",
                        runtime=0,
                        memory=0,
                    )

                compile_proc = await asyncio.create_subprocess_exec(
                    "g++", "-O3", str(cpp_file), "-o", str(exec_file),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                comp_stdout, comp_stderr = await compile_proc.communicate()
                
                if compile_proc.returncode != 0:
                    return ExecuteResponse(
                        status=SubmissionStatus.COMPILE_ERROR,
                        stdout=None,
                        stderr=comp_stderr.decode("utf-8", errors="replace"),
                        runtime=0,
                        memory=0,
                    )
                
                # Execute step
                start_time = time.perf_counter()
                proc = await asyncio.create_subprocess_exec(
                    str(exec_file),
                    stdin=asyncio.subprocess.PIPE,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                
                try:
                    stdout, stderr = await asyncio.wait_for(
                        proc.communicate(input=(request.stdin or "").encode("utf-8")),
                        timeout=5.0
                    )
                    runtime = time.perf_counter() - start_time
                    exit_code = proc.returncode
                except asyncio.TimeoutError:
                    try:
                        proc.kill()
                    except Exception:
                        pass
                    return ExecuteResponse(
                        status=SubmissionStatus.TIME_LIMIT_EXCEEDED,
                        stdout=None,
                        stderr="Execution timed out (5.0s limit reached).",
                        runtime=5.0,
                        memory=0,
                    )

                decoded_stdout = stdout.decode("utf-8", errors="replace")
                decoded_stderr = stderr.decode("utf-8", errors="replace")

                if exit_code != 0:
                    return ExecuteResponse(
                        status=SubmissionStatus.RUNTIME_ERROR,
                        stdout=decoded_stdout or None,
                        stderr=decoded_stderr or f"Exit code {exit_code}",
                        runtime=runtime,
                        memory=0,
                    )

                return ExecuteResponse(
                    status=SubmissionStatus.ACCEPTED,
                    stdout=decoded_stdout,
                    stderr=decoded_stderr or None,
                    runtime=runtime,
                    memory=0,
                )

            elif "javascript" in lang or "js" in lang:
                code_file = temp_dir / "solution.js"
                code_file.write_text(request.code, encoding="utf-8")
                
                # Check for node
                node_path = shutil.which("node")
                if not node_path:
                    return ExecuteResponse(
                        status=SubmissionStatus.RUNTIME_ERROR,
                        stdout=None,
                        stderr="node.js runtime is not available on the server.",
                        runtime=0,
                        memory=0,
                    )

                start_time = time.perf_counter()
                proc = await asyncio.create_subprocess_exec(
                    "node",
                    str(code_file),
                    stdin=asyncio.subprocess.PIPE,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                
                try:
                    stdout, stderr = await asyncio.wait_for(
                        proc.communicate(input=(request.stdin or "").encode("utf-8")),
                        timeout=5.0
                    )
                    runtime = time.perf_counter() - start_time
                    exit_code = proc.returncode
                except asyncio.TimeoutError:
                    try:
                        proc.kill()
                    except Exception:
                        pass
                    return ExecuteResponse(
                        status=SubmissionStatus.TIME_LIMIT_EXCEEDED,
                        stdout=None,
                        stderr="Execution timed out (5.0s limit reached).",
                        runtime=5.0,
                        memory=0,
                    )
                
                decoded_stdout = stdout.decode("utf-8", errors="replace")
                decoded_stderr = stderr.decode("utf-8", errors="replace")
                
                if exit_code != 0:
                    return ExecuteResponse(
                        status=SubmissionStatus.RUNTIME_ERROR,
                        stdout=decoded_stdout or None,
                        stderr=decoded_stderr or f"Exit code {exit_code}",
                        runtime=runtime,
                        memory=0,
                    )
                
                return ExecuteResponse(
                    status=SubmissionStatus.ACCEPTED,
                    stdout=decoded_stdout,
                    stderr=decoded_stderr or None,
                    runtime=runtime,
                    memory=0,
                )

            else:
                return ExecuteResponse(
                    status=SubmissionStatus.COMPILE_ERROR,
                    stdout=None,
                    stderr=f"Language '{request.language}' is not supported in the local sandbox environment. Supported languages are Python, C++, and JavaScript.",
                    runtime=0,
                    memory=0,
                )

        finally:
            # Clean up temp directory recursively
            shutil.rmtree(temp_dir, ignore_errors=True)
