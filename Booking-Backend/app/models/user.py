from pydantic import BaseModel
from typing import Optional

# User creation schema
class UserCreate(BaseModel):
    email: str
    name: str
    password: str

# User update schema  
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

# Database user model
class User(BaseModel):
    id: str
    email: str
    name: str
    hashed_password: str
    role: str = "user"

class UserInDB(User):
    pass

# Response schemas
class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminLogin(BaseModel):
    email: str
    password: str

class UpdateAppointment(BaseModel):
    time_slot: str
    service_type: str = "consultation"

class DoctorCreate(BaseModel):
    name: str
    specialty: str
    email: str
    phone: str
