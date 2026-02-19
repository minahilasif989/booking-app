from app.core.database import get_mongodb
from app.models.appointment import AppointmentCreate
from typing import List, Dict, Any
from app.utils.time_slots import generate_time_slots
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
async def create_appointment(db, appointment_data: AppointmentCreate, user_id: str) -> Dict[str, Any]:
    # Check if time slot is available
    existing = await db.appointments.find_one({
        "doctor_id": appointment_data.doctor_id,
        "appointment_date": appointment_data.appointment_date,
        "time_slot": appointment_data.time_slot
    })
    if existing:
        raise ValueError("Time slot already booked")
    
    appointment_dict = appointment_data.dict()
    appointment_dict["user_id"] = user_id
    appointment_dict["status"] = "confirmed"
    
    result = await db.appointments.insert_one(appointment_dict)
    return {"id": str(result.inserted_id), **appointment_dict}

async def get_user_appointments(db: AsyncIOMotorDatabase, user_id: str):
    """Accepts user_id string (MongoDB ObjectId)"""
    appointments = await db.appointments.find({"user_id": user_id}).to_list(length=100)
    return appointments

async def get_all_appointments(db) -> List[Dict[str, Any]]:
    appointments = []
    cursor = db.appointments.find()
    async for appointment in cursor:
        appointment["id"] = str(appointment["_id"])
        appointments.append(appointment)
    return appointments
