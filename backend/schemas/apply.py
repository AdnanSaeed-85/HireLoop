from pydantic import BaseModel, EmailStr
from typing import Optional

class CandidateApplyRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    personal_portfolio: Optional[str] = None
    address: Optional[str] = None
    job_id: str