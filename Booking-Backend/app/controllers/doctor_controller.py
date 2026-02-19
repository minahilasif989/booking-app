from app.core.database import get_mongodb
from app.models.doctor import DoctorCreate, DoctorUpdate
from app.models.service import ServiceCreate
from typing import List, Dict, Any

async def create_doctor(db, doctor_data: DoctorCreate) -> Dict[str, Any]:
    result = await db.doctors.insert_one(doctor_data.dict())
    return {"id": str(result.inserted_id), **doctor_data.dict()}

async def get_all_doctors(db) -> List[Dict[str, Any]]:
    doctors = []
    cursor = db.doctors.find()
    async for doctor in cursor:
        doctor["id"] = str(doctor["_id"])
        services = await db.services.find({"doctor_id": doctor["id"]}).to_list(length=None)
        for service in services:
            service["id"] = str(service["_id"])
        doctor["services"] = services
        doctors.append(doctor)
    return doctors

async def update_doctor(db, doctor_id: str, update_data: DoctorUpdate) -> Dict[str, Any]:
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    result = await db.doctors.update_one(
        {"_id": doctor_id}, 
        {"$set": update_dict}
    )
    if result.modified_count == 0:
        raise ValueError("Doctor not found")
    return await db.doctors.find_one({"_id": doctor_id})

async def delete_doctor(db, doctor_id: str):
    result = await db.doctors.delete_one({"_id": doctor_id})
    if result.deleted_count == 0:
        raise ValueError("Doctor not found")
    return {"message": "Doctor deleted successfully"}

async def add_service_to_doctor(db, service_data: ServiceCreate) -> Dict[str, Any]:
    result = await db.services.insert_one(service_data.dict())
    return {"id": str(result.inserted_id), **service_data.dict()}
