from pydantic import BaseModel
from typing import List, Any

class DoctorOut(BaseModel):
    id: str
    name: str
    specialty: str
    services: List[Any] = []

class DoctorListOut(BaseModel):
    doctors: List[DoctorOut]
