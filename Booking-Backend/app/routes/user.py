from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.database import get_mongodb
from app.core.security import verify_token
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter(prefix="/user", tags=["user"])
# 1. GET ALL DOCTORS
@router.get("/doctors")
async def get_doctors(db: AsyncIOMotorDatabase = Depends(get_mongodb)):
    doctors = await db.doctors.find().to_list(length=100)
    for doc in doctors:
        doc["id"] = str(doc["_id"]) 
        if "_id" in doc: del doc["_id"]
    return doctors 
# 2. GET ALL USER APPOINTMENTS
@router.get("/appointments")
async def get_user_appointments(
    payload: dict = Depends(verify_token), 
    db: AsyncIOMotorDatabase = Depends(get_mongodb)
):
    current_user_email = payload.get("sub")
    cursor = db.appointments.find({"user_email": current_user_email})
    appointments = await cursor.to_list(length=100)
    for apt in appointments:
        apt["id"] = str(apt["_id"])
        if "_id" in apt: del apt["_id"]
    return appointments

# 3. GET SINGLE APPOINTMENT DETAILS
@router.get("/appointments/details/{apt_id}")
async def get_single_appointment(
    apt_id: str,
    payload: dict = Depends(verify_token),
    db: AsyncIOMotorDatabase = Depends(get_mongodb)
):
    current_user = payload.get("sub")
    try:
        appointment = await db.appointments.find_one({"_id": ObjectId(apt_id), "user_email": current_user})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appointment["id"] = str(appointment["_id"])
        if "_id" in appointment: del appointment["_id"]
        return appointment
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

# 4. UPDATE APPOINTMENT (PUT)
@router.put("/appointments/details/{apt_id}")
async def update_appointment(
    apt_id: str,
    appointment_data: dict = Body(...),
    payload: dict = Depends(verify_token),
    db: AsyncIOMotorDatabase = Depends(get_mongodb)
):
    current_user = payload.get("sub")
    try:
        update_data = {
            "time_slot": appointment_data.get("time_slot"),
            "service_type": appointment_data.get("service_type"),
            "updated_at": datetime.utcnow().isoformat()
        }
        result = await db.appointments.update_one(
            {"_id": ObjectId(apt_id), "user_email": current_user},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return {"success": True, "message": "Updated!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. POST BOOK APPOINTMENT
@router.post("/appointments")
async def book_appointment(
    appointment_data: dict = Body(...), 
    payload: dict = Depends(verify_token),
    db: AsyncIOMotorDatabase = Depends(get_mongodb)
):
    current_user_email = payload.get("sub")
    
    # 1. Pehle check karo ke kya ye slot pehle se booked hai?
    doctor_id = str(appointment_data.get("doctor_id"))
    app_date = str(appointment_data.get("appointment_date"))
    time_slot = str(appointment_data.get("time_slot"))

    existing_booking = await db.appointments.find_one({
        "doctor_id": doctor_id,
        "appointment_date": app_date,
        "time_slot": time_slot,
        "status": {"$ne": "cancelled"} # Sirf unko check karo jo cancel nahi huin
    })

    if existing_booking:
        # Agar booking mil gayi, toh error bhej do
        raise HTTPException(
            status_code=400, 
            detail="Time slot is not available.Please select a different time or date."
        )

    # 2. Agar slot khali hai, toh booking save karo
    new_appointment = {
        "user_email": str(current_user_email),
        "doctor_id": doctor_id,
        "doctor_name": appointment_data.get("doctor_name", "Unknown Doctor"),
        "appointment_date": app_date,
        "time_slot": time_slot,
        "status": "confirmed",
        "service_type": appointment_data.get("service_id", "consultation"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.appointments.insert_one(new_appointment)
    return {"success": True, "id": str(result.inserted_id)}

# 6. MARK AS DONE (PATCH)
@router.patch("/appointments/done/{apt_id}") 
async def mark_as_done(apt_id: str, db: AsyncIOMotorDatabase = Depends(get_mongodb)):
    try:
        await db.appointments.update_one(
            {"_id": ObjectId(apt_id)},
            {"$set": {"status": "completed"}}
        )
        return {"success": True}
    except:
        raise HTTPException(status_code=400, detail="Error")

# 7. DELETE APPOINTMENT
@router.delete("/appointments/{apt_id}")
async def delete_appointment(apt_id: str, db: AsyncIOMotorDatabase = Depends(get_mongodb)):
    try:
        await db.appointments.delete_one({"_id": ObjectId(apt_id)})
        return {"success": True}
    except:
        raise HTTPException(status_code=400, detail="Error")