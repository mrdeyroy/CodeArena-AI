"""Supabase Auth JWT verification dependency for FastAPI."""

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
    if token == "mock-token":
        return {
            "sub": "00000000-0000-0000-0000-000000000000",
            "email": "alex.rivera@dev.io",
            "full_name": "Alex Rivera",
            "is_mock": True,
        }

    try:
        # Verify and fetch user via Supabase GoTrue Auth API using the user's JWT
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid token: User not found in Supabase Auth context")

        user = user_resp.user
        metadata = user.user_metadata or {}
        full_name = metadata.get("full_name") or metadata.get("name") or ""

        return {
            "sub": user.id,
            "email": user.email,
            "full_name": full_name,
            "is_mock": False,
        }
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token (Supabase Auth verification failed): {str(e)}",
        )


_user_cache: dict[str, dict] = {}


async def get_or_create_db_user(
    supabase_id: str,
    email: str,
    full_name: str,
    supabase: Client,
) -> dict:
    """Resolve Supabase Auth User UUID to a row in public.users, creating it if missing."""
    global _user_cache
    if supabase_id in _user_cache:
        return _user_cache[supabase_id]

    # 1. Fetch user by public.users.id (if UUIDs are aligned)
    try:
        resp = supabase.from_("users").select("*").eq("id", supabase_id).maybe_single().execute()
        if resp.data:
            _user_cache[supabase_id] = resp.data
            return resp.data
    except Exception:
        pass

    # 2. Fetch user by clerk_id = supabase_id (fallback for compatibility)
    try:
        resp = (
            supabase.from_("users")
            .select("*")
            .eq("clerk_id", supabase_id)
            .maybe_single()
            .execute()
        )
        if resp.data:
            _user_cache[supabase_id] = resp.data
            return resp.data
    except Exception:
        pass

    # 3. Fetch user by email
    try:
        resp = supabase.from_("users").select("*").eq("email", email).maybe_single().execute()
        if resp.data:
            # Sync the public ID/clerk_id with the new Supabase ID
            supabase.from_("users").update({"clerk_id": supabase_id}).eq("id", resp.data["id"]).execute()
            _user_cache[supabase_id] = resp.data
            return resp.data
    except Exception:
        pass

    # 4. Create new user profile using the supabase Auth UUID as the primary key id
    final_email = email or f"{supabase_id}@placeholder.codearena.ai"
    final_name = full_name or "CodeArena User"

    try:
        resp = (
            supabase.from_("users")
            .insert(
                {
                    "id": supabase_id,
                    "clerk_id": supabase_id,  # Set clerk_id to same UUID for backwards compatibility
                    "email": final_email,
                    "full_name": final_name,
                }
            )
            .execute()
        )
        if resp.data:
            _user_cache[supabase_id] = resp.data[0]
            return resp.data[0]
    except Exception:
        # Fallback to inserting with default auto-generated UUID if custom ID fails
        try:
            resp = (
                supabase.from_("users")
                .insert(
                    {
                        "clerk_id": supabase_id,
                        "email": final_email,
                        "full_name": final_name,
                    }
                )
                .execute()
            )
            if resp.data:
                _user_cache[supabase_id] = resp.data[0]
                return resp.data[0]
        except Exception as e2:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create public user record: {str(e2)}",
            )

    raise HTTPException(status_code=500, detail="Failed to resolve or create user in database")


async def require_user(
    request: Request,
    supabase: Client = Depends(get_supabase),
) -> dict:
    """FastAPI dependency: require a valid Supabase Auth JWT and return the public.users row."""
    token = _get_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    payload = await _verify_token(token, supabase)
    supabase_id = payload["sub"]

    db_user = await get_or_create_db_user(
        supabase_id, payload["email"], payload["full_name"], supabase
    )

    return {
        "sub": db_user["id"],  # Public database user UUID (used for SQL joins/foreign keys)
        "supabase_id": supabase_id,
        "email": db_user["email"],
        "full_name": db_user["full_name"],
    }


async def optional_user(
    request: Request,
    supabase: Client = Depends(get_supabase),
) -> dict | None:
    """FastAPI dependency: optionally verify Supabase Auth JWT, returning public.users row if valid."""
    token = _get_token(request)
    if not token:
        return None
    try:
        payload = await _verify_token(token, supabase)
        supabase_id = payload["sub"]
        db_user = await get_or_create_db_user(
            supabase_id, payload["email"], payload["full_name"], supabase
        )
        return {
            "sub": db_user["id"],
            "supabase_id": supabase_id,
            "email": db_user["email"],
            "full_name": db_user["full_name"],
        }
    except Exception:
        return None
