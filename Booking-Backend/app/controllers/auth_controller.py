from app.core.database import get_mongodb
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import UserCreate
from app.schemas.user import Token
from typing import Dict, Any

async def create_user(db, user: UserCreate) -> Dict[str, Any]:
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise ValueError("User already exists")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    user_dict["role"] = "user"
    
    result = await db.users.insert_one(user_dict)
    return {"id": str(result.inserted_id), **user_dict}

async def authenticate_user(db, email: str, password: str) -> Token:
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise ValueError("Incorrect email or password")
    
    access_token = create_access_token(
    data={"sub": user["email"], "role": user["role"]}
    )
    return Token(access_token=access_token)
