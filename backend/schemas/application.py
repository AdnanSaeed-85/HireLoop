from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ApplicationOutput(BaseModel):
    candidate_id: UUID
    job_id: UUID
    status: str
    overall_score: Optional[float] = None
    skills_score: Optional[float] = None
    experience_score: Optional[float] = None
    project_score: Optional[float] = None
    education_score: Optional[float] = None
    scoring_reasoning: Optional[str] = None

class ApplicationResponse(BaseModel):
    application_id: UUID
    candidate_id: UUID
    job_id: UUID
    status: str
    overall_score: Optional[float] = None
    skills_score: Optional[float] = None
    experience_score: Optional[float] = None
    project_score: Optional[float] = None
    education_score: Optional[float] = None
    scoring_reasoning: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {UUID: str}