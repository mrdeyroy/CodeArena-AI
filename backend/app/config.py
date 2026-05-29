from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    openai_api_key: str
    openai_base_url: str = "https://api.openai.com/v1"
    ai_model: str = "gpt-4o"

    piston_api_url: str = "https://emkc.org/api/v2/piston"

    clerk_secret_key: str | None = None
    clerk_jwt_public_key: str | None = None
    clerk_jwks_url: str | None = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
