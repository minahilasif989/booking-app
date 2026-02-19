from pydantic import BaseModel
from typing import Optional, List

# User registration schema 
class UserCreate(BaseModel):
    email: str
    name: str
    password: str  

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str = "user"

# Token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Login request
class UserLogin(BaseModel):
    email: str
    password: str

# User profile update
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
