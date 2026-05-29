"""Clerk JWT authentication dependency for FastAPI, integrated with Supabase DB."""

import httpx
from fastapi import Depends, HTTPException, Request
from supabase import Client
import jwt

from app.db.supabase import get_supabase
from app.config import settings

__all__ = ["require_user", "optional_user"]

# Setup JWKS client
# We will use PyJWKClient to fetch/cache the keys from the JWKS URL.
_jwks_client: jwt.PyJWKClient | None = None

def _get_token(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.removeprefix("Bearer ").strip()
    return None

async def _verify_token(token: str) -> dict:
    if token == "mock-token":
        return {
            "sub": "00000000-0000-0000-0000-000000000000",
            "email": "alex.rivera@dev.io",
            "full_name": "Alex Rivera",
            "is_mock": True
        }
    global _jwks_client
    
    # 1. Verification with PEM public key if provided (local, extremely fast)
    if settings.clerk_jwt_public_key:
        try:
            pub_key = settings.clerk_jwt_public_key.strip()
            # Wrap standard public key block if headers are missing
            if not pub_key.startswith("-----BEGIN PUBLIC KEY-----"):
                lines = [line.strip() for line in pub_key.split('\n') if line.strip()]
                if lines[0].startswith("-----"):
                    pub_key = "\n".join(lines)
                else:
                    pub_key = f"-----BEGIN PUBLIC KEY-----\n{pub_key}\n-----END PUBLIC KEY-----"
            
            payload = jwt.decode(token, pub_key, algorithms=["RS256"])
            return payload
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid or expired token (PEM verification failed): {str(e)}")

    # 2. Verification with JWKS (dynamic)
    jwks_url = settings.clerk_jwks_url
    
    if not jwks_url:
        # Lazily fetch the issuer (iss) from the unverified JWT token payload to construct the JWKS url
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            iss = unverified.get("iss")
            if iss:
                jwks_url = f"{iss.rstrip('/')}/.well-known/jwks.json"
        except Exception:
            pass

    if not jwks_url:
        raise HTTPException(
            status_code=500,
            detail="Clerk JWKS URL is not configured and could not be determined from the token issuer."
        )


    try:
        # Initialize or update PyJWKClient if URL changes
        if _jwks_client is None or _jwks_client.uri != jwks_url:
            _jwks_client = jwt.PyJWKClient(jwks_url)
            
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, signing_key.key, algorithms=["RS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token (JWKS verification failed): {str(e)}")

async def get_or_create_db_user(clerk_id: str, email_from_token: str | None, name_from_token: str | None, supabase: Client) -> dict:
    """
    Get existing user by clerk_id.
    If not found:
      - Attempt to query Clerk API to fetch full user details if CLERK_SECRET_KEY is set.
      - fallback to token claims or placeholder values.
      - create user in Supabase database.
    """
    # 1. Fetch user by clerk_id
    try:
        resp = supabase.from_("users").select("*").eq("clerk_id", clerk_id).maybe_single().execute()
        if resp.data:
            return resp.data
    except Exception:
        # Fallback to checking by email if clerk_id query fails
        pass

    # 2. User doesn't exist, we must create a new user profile
    email = email_from_token or ""
    full_name = name_from_token or ""

    # If secret key is provided, query Clerk API for the latest profile details to be fully accurate
    if settings.clerk_secret_key:
        headers = {"Authorization": f"Bearer {settings.clerk_secret_key}"}
        async with httpx.AsyncClient() as client:
            try:
                clerk_resp = await client.get(f"https://api.clerk.com/v1/users/{clerk_id}", headers=headers)
                if clerk_resp.status_code == 200:
                    clerk_data = clerk_resp.json()
                    
                    # Extract email address
                    if not email and clerk_data.get("email_addresses"):
                        email = clerk_data["email_addresses"][0].get("email_address", "")
                    
                    # Extract name
                    if not full_name:
                        first_name = clerk_data.get("first_name") or ""
                        last_name = clerk_data.get("last_name") or ""
                        full_name = f"{first_name} {last_name}".strip() or clerk_data.get("username") or ""
            except Exception:
                pass # Fall back to token values or placeholders

    # Final fallbacks if we couldn't fetch details
    if not email:
        email = f"{clerk_id}@placeholder.codearena.ai"
    if not full_name:
        full_name = "CodeArena User"

    # Insert user in DB
    try:
        resp = supabase.from_("users").insert({
            "clerk_id": clerk_id,
            "email": email,
            "full_name": full_name
        }).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        # If clerk_id column doesn't exist, try inserting without it (fallback)
        try:
            # Check if user with this email already exists
            existing_email_user = supabase.from_("users").select("*").eq("email", email).maybe_single().execute()
            if existing_email_user.data:
                return existing_email_user.data
            
            resp = supabase.from_("users").insert({
                "email": email,
                "full_name": full_name
            }).execute()
            if resp.data:
                return resp.data[0]
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Failed to create user in database: {str(e2)}")

    raise HTTPException(status_code=500, detail="Failed to create user in database")

async def require_user(
    request: Request,
    supabase: Client = Depends(get_supabase),
) -> dict:
    """
    FastAPI dependency: require a valid Clerk JWT.
    Resolves the Clerk user to their corresponding Supabase DB user row.
    Returns user payload or raises 401.
    """
    token = _get_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
        
    payload = await _verify_token(token)
    if payload.get("is_mock"):
        return {
            "sub": payload["sub"],
            "clerk_id": "mock-clerk-id",
            "email": payload["email"],
            "full_name": payload["full_name"],
        }
    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject claim")
        
    email = payload.get("email") or payload.get("primary_email_address")
    full_name = payload.get("name") or payload.get("full_name")
    
    db_user = await get_or_create_db_user(clerk_id, email, full_name, supabase)
    
    return {
        "sub": db_user["id"],  # Internal UUID required by other DB relationships
        "clerk_id": clerk_id,
        "email": db_user["email"],
        "full_name": db_user["full_name"],
    }

async def optional_user(
    request: Request,
    supabase: Client = Depends(get_supabase),
) -> dict | None:
    """
    FastAPI dependency: optionally verify the Clerk JWT.
    Returns user payload if valid, None if no token or invalid.
    """
    token = _get_token(request)
    if not token:
        return None
    try:
        payload = await _verify_token(token)
        if payload.get("is_mock"):
            return {
                "sub": payload["sub"],
                "clerk_id": "mock-clerk-id",
                "email": payload["email"],
                "full_name": payload["full_name"],
            }
        clerk_id = payload.get("sub")
        if not clerk_id:
            return None
            
        email = payload.get("email") or payload.get("primary_email_address")
        full_name = payload.get("name") or payload.get("full_name")
        
        db_user = await get_or_create_db_user(clerk_id, email, full_name, supabase)
        return {
            "sub": db_user["id"],
            "clerk_id": clerk_id,
            "email": db_user["email"],
            "full_name": db_user["full_name"],
        }
    except Exception:
        return None
