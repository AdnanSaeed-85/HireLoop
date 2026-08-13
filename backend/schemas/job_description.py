from pydantic import BaseModel
from typing import Optional

class JDCreateRequest(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    experience_years: Optional[int] = None
    bias_enabled: bool = False

class JDUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    experience_years: Optional[int] = None
    bias_enabled: Optional[bool] = None
    is_active: Optional[bool] = None

class JDResponse(BaseModel):
    job_id: str
    title: str
    description: str
    requirements: Optional[str] = None
    experience_years: Optional[int] = None
    bias_enabled: bool
    is_active: bool

    class Config:
        from_attributes = True