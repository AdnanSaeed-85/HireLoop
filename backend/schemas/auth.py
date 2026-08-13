from pydantic import BaseModel, EmailStr

class HrRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class HrLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"