from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class CandidatePersonalOutput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    personal_portfolio: Optional[str] = None
    address: Optional[str] = None

class CandidateCVOutput(BaseModel):
    skills: Optional[str] = None
    experience: Optional[str] = None
    projects: Optional[str] = None
    certifications: Optional[str] = None
    education: Optional[str] = None
    raw_text: Optional[str] = None

class CandidateResponse(BaseModel):
    candidate_id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    personal_portfolio: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {UUID: str}