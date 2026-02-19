from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.controllers.auth_controller import create_user, authenticate_user
from app.core.database import get_mongodb
from app.core.security import create_access_token 
from app.schemas.user import Token, UserLogin, UserCreate 
from motor.motor_asyncio import AsyncIOMotorDatabase

# 1. Router setup 
router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_mongodb)):
    try:
        await create_user(db, user)
        # Security file se token banana
        token_str = create_access_token({"sub": user.email})
        return Token(access_token=token_str, token_type="bearer")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_mongodb)):
    try:
        # Step 1: Password/Email verify karein (Controller se)
        await authenticate_user(db, user_credentials.email, user_credentials.password)
        
        # Step 2: Token generate karein
        token_str = create_access_token({"sub": user_credentials.email})
        
        return Token(access_token=token_str, token_type="bearer")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))