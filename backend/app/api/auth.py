"""Auth router: register and login via Supabase Auth."""

from fastapi import APIRouter, HTTPException

from app.db.supabase import get_supabase
from app.schemas.schemas import AuthRegisterRequest, AuthLoginRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(request: AuthRegisterRequest):
    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {"data": {"full_name": request.full_name}},
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if resp.user is None:
        raise HTTPException(status_code=400, detail="Registration failed")

    return AuthResponse(
        user_id=resp.user.id,
        email=resp.user.email or "",
        access_token=resp.session.access_token if resp.session else "",
        refresh_token=resp.session.refresh_token if resp.session else "",
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: AuthLoginRequest):
    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if resp.user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return AuthResponse(
        user_id=resp.user.id,
        email=resp.user.email or "",
        access_token=resp.session.access_token,
        refresh_token=resp.session.refresh_token,
    )
