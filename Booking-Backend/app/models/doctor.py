from pydantic import BaseModel
from typing import List, Optional
from app.utils.time_slots import DayOfWeek

class DoctorBase(BaseModel):
    name: str
    specialty: str
    available_days: List[DayOfWeek]
    start_time: str = "09:00"
    end_time: str = "18:00"

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    available_days: Optional[List[DayOfWeek]] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class Doctor(DoctorBase):
    id: str
    
    class Config:
        from_attributes = True
