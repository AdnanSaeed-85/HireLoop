from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID

from backend.db import Base


class Application(Base):
    __tablename__ = "applications"

    application_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    candidate_id = Column(
        UUID(as_uuid=True),
        ForeignKey("candidates.candidate_id"),
        nullable=False
    )

    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.job_id"),
        nullable=False
    )

    # Application status
    status = Column(
        String,
        nullable=False,
        default="pending"
    )

    # -------------------------
    # Skills Evaluation
    # -------------------------

    skills_score = Column(
        Float,
        nullable=True
    )

    skills_matched = Column(
        Text,
        nullable=True
    )

    skills_missing = Column(
        Text,
        nullable=True
    )

    skills_reasoning = Column(
        Text,
        nullable=True
    )

    # -------------------------
    # Experience Evaluation
    # -------------------------

    experience_score = Column(
        Float,
        nullable=True
    )

    experience_years_found = Column(
        Float,
        nullable=True
    )

    experience_years_required = Column(
        Float,
        nullable=True
    )

    experience_reasoning = Column(
        Text,
        nullable=True
    )

    # -------------------------
    # Project Evaluation
    # -------------------------

    project_score = Column(
        Float,
        nullable=True
    )

    project_relevent = Column(
        Text,
        nullable=True
    )

    project_reasoning = Column(
        Text,
        nullable=True
    )

    # -------------------------
    # Education Evaluation
    # -------------------------

    education_score = Column(
        Float,
        nullable=True
    )

    education_degree = Column(
        String,
        nullable=True
    )

    education_reasoning = Column(
        Text,
        nullable=True
    )

    # -------------------------
    # Overall Evaluation
    # -------------------------

    overall_score = Column(
        Float,
        nullable=True
    )

    scoring_reasoning = Column(
        Text,
        nullable=True
    )

    recommendation = Column(
        String,
        nullable=True
    )

    # -------------------------
    # Timestamps
    # -------------------------

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )