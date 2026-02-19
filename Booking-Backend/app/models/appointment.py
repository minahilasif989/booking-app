from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
from app.utils.time_slots import DayOfWeek

class AppointmentBase(BaseModel):
    doctor_id: str
    service_id: str
    appointment_date: str  # YYYY-MM-DD
    time_slot: str  # HH:MM
    user_name: str
    user_email: str

class AppointmentCreate(AppointmentBase):
    @validator('time_slot')
    def validate_time_slot(cls, v):
        time = datetime.strptime(v, "%H:%M")
        if time.hour < 9 or time.hour >= 18:
            raise ValueError('Time slot must be between 09:00 and 18:00')
        return v

class Appointment(AppointmentBase):
    id: str
    user_id: str
    status: str = "confirmed"  # confirmed, cancelled
    
    class Config:
        from_attributes = True
