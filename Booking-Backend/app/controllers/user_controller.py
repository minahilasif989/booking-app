from app.core.database import get_mongodb
from app.models.user import UserUpdate
from typing import Dict, Any, List
from app.core.security import verify_token

async def get_user_profile(db, token: str) -> Dict[str, Any]:
    payload = await verify_token(token)
    if not payload:
        raise ValueError("Invalid token")
    
    user = await db.users.find_one({"email": payload["sub"]})
    if not user:
        raise ValueError("User not found")
    
    return user

async def update_user_profile(db, token: str, update_data: UserUpdate) -> Dict[str, Any]:
    payload = await verify_token(token)
    if not payload:
        raise ValueError("Invalid token")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if update_dict:
        result = await db.users.update_one(
            {"email": payload["sub"]}, 
            {"$set": update_dict}
        )
        if result.modified_count == 0:
            raise ValueError("User not found or no changes")
    
    updated_user = await db.users.find_one({"email": payload["sub"]})
    return updated_user
