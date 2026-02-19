from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    doctor_id: str
    name: str
    duration_minutes: int = 30
    price: float

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None

class Service(ServiceBase):
    id: str
    
    class Config:
        from_attributes = True
