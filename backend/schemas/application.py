from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class ApplicationOutput(BaseModel):
    candidate_id: UUID
    job_id: UUID
    status: str = "pending"

    skills_score: Optional[float] = None
    skills_matched: Optional[str] = None
    skills_missing: Optional[str] = None
    skills_reasoning: Optional[str] = None

    experience_score: Optional[float] = None
    experience_years_found: Optional[float] = None
    experience_years_required: Optional[float] = None
    experience_reasoning: Optional[str] = None

    project_score: Optional[float] = None
    project_relevent: Optional[str] = None
    project_reasoning: Optional[str] = None

    education_score: Optional[float] = None
    education_degree: Optional[str] = None
    education_reasoning: Optional[str] = None

    overall_score: Optional[float] = None
    scoring_reasoning: Optional[str] = None

    recommendation: Optional[str] = None


class ApplicationResponse(BaseModel):
    application_id: UUID
    candidate_id: UUID
    job_id: UUID
    status: str

    skills_score: Optional[float] = None
    skills_matched: Optional[str] = None
    skills_missing: Optional[str] = None
    skills_reasoning: Optional[str] = None

    experience_score: Optional[float] = None
    experience_years_found: Optional[float] = None
    experience_years_required: Optional[float] = None
    experience_reasoning: Optional[str] = None

    project_score: Optional[float] = None
    project_relevent: Optional[str] = None
    project_reasoning: Optional[str] = None

    education_score: Optional[float] = None
    education_degree: Optional[str] = None
    education_reasoning: Optional[str] = None

    overall_score: Optional[float] = None
    scoring_reasoning: Optional[str] = None

    recommendation: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)