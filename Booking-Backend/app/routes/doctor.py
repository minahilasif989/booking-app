from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.controllers.doctor_controller import get_all_doctors
from app.core.database import get_db_dependency
from app.core.security import verify_token
from app.schemas.doctor import DoctorListOut
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/doctor", tags=["doctor"])
security = HTTPBearer()
# JWT Settings
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

async def get_current_doctor(credentials: HTTPAuthorizationCredentials = Depends(security),
                            db: AsyncIOMotorDatabase = Depends(get_db_dependency)):
    token = credentials.credentials
    payload = await verify_token(token)
    if not payload or payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload

@router.get("/doctors")
async def list_doctors_doctor(current_doctor=Depends(get_current_doctor),
                             db: AsyncIOMotorDatabase = Depends(get_db_dependency)):
    doctors = await get_all_doctors(db)
    return DoctorListOut(doctors=doctors)
