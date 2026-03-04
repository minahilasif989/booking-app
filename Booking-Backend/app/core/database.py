from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from typing import AsyncGenerator

# Create ONE global client
client = AsyncIOMotorClient(settings.MONGODB_URL)
database = client[settings.DATABASE_NAME]

async def get_mongodb() -> AsyncGenerator:
    try:
        yield database
    finally:
        pass  # Do NOT close client here


# Dependency to use in routes
async def get_db_dependency():
    return database