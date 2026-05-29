"""Supabase JWT authentication dependency for FastAPI."""

from fastapi import Depends, HTTPException, Request
from supabase import Client

from app.db.supabase import get_supabase

__all__ = ["require_user", "optional_user"]


def _get_token(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.removeprefix("Bearer ").strip()
    return None


async def _verify_token(token: str, supabase: Client) -> dict:
    try:
        response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {
        "sub": response.user.id,
        "email": response.user.email,
        "full_name": response.user.user_metadata.get("full_name", "") if response.user.user_metadata else "",
    }


async def require_user(
    request: Request,
    supabase: Client = Depends(get_supabase),
) -> dict:
    """
    FastAPI dependency: require a valid Supabase JWT. Returns user payload or raises 401.

    Usage:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(require_user)):
            user_id = user["sub"]
            ...
    """
    token = _get_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return await _verify_token(token, supabase)


async def optional_user(
    request: Request,
    supabase: Client = Depends(get_supabase),
) -> dict | None:
    """
    FastAPI dependency: optionally verify the Supabase JWT.
    Returns user payload if valid, None if no token or invalid.

    Usage:
        @router.get("/public")
        async def public_route(user: dict | None = Depends(optional_user)):
            if user:
                user_id = user["sub"]
    """
    token = _get_token(request)
    if not token:
        return None
    try:
        return await _verify_token(token, supabase)
    except HTTPException:
        return None
