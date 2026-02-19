from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.controllers.doctor_controller import create_doctor, update_doctor, delete_doctor
from app.controllers.appointment_controller import get_all_appointments
from app.core.database import get_db_dependency
from app.core.security import verify_token
from app.models.doctor import DoctorCreate, DoctorUpdate
from app.schemas.appointment import AppointmentListOut
from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone 
from app.core.config  import settings 
import jwt
from typing import Optional
from bson import ObjectId

# JWT Settings
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer()

class AdminLogin(BaseModel):
    email: str
    password: str

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security),
                          db: AsyncIOMotorDatabase = Depends(get_db_dependency)):
    token = credentials.credentials
    payload = await verify_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload
@router.post("/login")
async def admin_login(credentials: AdminLogin):
    if credentials.email == settings.ADMIN_EMAIL and credentials.password == settings.ADMIN_PASSWORD:
        token = jwt.encode(
            {
                "sub": credentials.email,
                "role": "admin", 
                "exp": datetime.now(timezone.utc) + timedelta(hours=24)
            },
            settings.SECRET_KEY, 
            algorithm="HS256"
        )
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# 2. ALL USERS 
@router.get("/users")
async def get_all_users(
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency),
    limit: int = Query(50, le=100)
):
    users = await db.users.find({}, {"password": 0}).limit(limit).to_list(length=limit)
    user_list = []
    for user in users:
        count = await db.appointments.count_documents({"user_email": user["email"], "status": {"$ne": "cancelled"}})
        user_list.append({
            "id": str(user["_id"]),
            "email": user["email"], 
            "name": user.get("name", ""),
            "total_appointments": count,
            "created_at": user.get("created_at", "")
        })
    return user_list

#  3. STATS
@router.get("/stats")
async def admin_stats(
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    total = await db.appointments.count_documents({})
    today = datetime.now().date()
    today_count = await db.appointments.count_documents({
        "appointment_date": str(today)
    })
    completed = await db.appointments.count_documents({"status": "done"})
    return {"total": total, "today": today_count, "completed": completed}

# 4. ALL APPOINTMENTS 
@router.get("/appointments")
async def get_admin_appointments(
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    appointments = await db.appointments.find().sort("appointment_date", -1).limit(100).to_list(length=100)
    for apt in appointments:
        apt["id"] = str(apt["_id"])
        apt["user_email"] = apt.get("user_email", "Unknown")
        apt["doctor_name"] = apt.get("doctor_name", "Unknown")
    return appointments

# 5. CANCEL APPOINTMENT
@router.put("/appointments/{appointment_id}/cancel")
async def admin_cancel_appointment(
    appointment_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": "cancelled"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Cancelled"}

# 6. MARK DONE
@router.put("/appointments/{appointment_id}/done")
async def admin_mark_done(
    appointment_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": "done"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Marked done"}

# 7. DOCTORS ROUTES 
@router.get("/doctors")
async def get_all_doctors(
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    doctors = await db.doctors.find().to_list(length=100)
    if not doctors:
        doctors = [
            {"_id": "1", "name": "Dr. Ahmed Khan", "specialty": "Cardiologist"},
            {"_id": "2", "name": "Dr. john", "specialty": "Dentist"}
        ]
    return doctors

@router.post("/doctors")
async def create_doctor_simple(
    doctor_data: dict,
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    result = await db.doctors.insert_one(doctor_data)
    return {"_id": str(result.inserted_id), **doctor_data}

@router.delete("/doctors/{doctor_id}")
async def delete_doctor_simple(
    doctor_id: str,
    current_admin=Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    await db.doctors.delete_one({"_id": ObjectId(doctor_id)})
    return {"message": "Doctor deleted"}
