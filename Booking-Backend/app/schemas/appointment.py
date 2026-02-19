from pydantic import BaseModel
from typing import List, Any

class AppointmentOut(BaseModel):
    id: str
    doctor_id: str
    appointment_date: str
    time_slot: str

class AppointmentListOut(BaseModel):
    appointments: List[AppointmentOut]
