from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from typing import AsyncGenerator
from fastapi import Depends
async def get_mongodb() -> AsyncGenerator:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    try:
        yield db
    finally:
        client.close()

# Yeh dependency routes mein use hogi
async def get_db_dependency(db=Depends(get_mongodb)):
    return db