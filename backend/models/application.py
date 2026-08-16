from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from backend.db import Base

class Application(Base):
    __tablename__ = "applications"

    application_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.candidate_id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_descriptions.job_id"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    overall_score = Column(Float, nullable=True)
    skills_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)
    project_score = Column(Float, nullable=True)
    education_score = Column(Float, nullable=True)
    scoring_reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
