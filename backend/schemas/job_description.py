from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class JDCreateRequest(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: bool = True

class JDUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: Optional[bool] = None

class JDResponse(BaseModel):
    job_id: UUID
    title: str
    description: str
    requirements: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True