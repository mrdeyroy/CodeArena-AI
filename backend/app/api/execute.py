from fastapi import APIRouter, HTTPException

from app.schemas.schemas import ExecuteRequest, ExecuteResponse
from app.services.piston import PistonService

router = APIRouter(prefix="/execute", tags=["code-execution"])

piston = PistonService()


@router.post("", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest):
    """Execute code via Piston and return results."""
    try:
        return await piston.execute(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
