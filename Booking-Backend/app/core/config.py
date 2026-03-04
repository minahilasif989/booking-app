from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()  
print(f"CONFIG LOADED SECRET: '{os.getenv('SECRET_KEY')}'")
print(f"DEFAULT SECRET: 'super-secret-key-change-in-production-2026xyz123'")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Booking App"
    VERSION: str = "1.0.0"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-2026xyz123")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "booking_app")

    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    class Config:
        env_file = ".env"

settings = Settings()

