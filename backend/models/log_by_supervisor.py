from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer
from datetime import datetime, timezone
import uuid
from backend.db import Base

class SupervisorLog(Base):
    __tablename__ = "supervisor_logs"

    log_id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id  = Column(UUID(as_uuid=True), ForeignKey("applications.application_id"), nullable=True)
    # nullable because some logs are system-level, not candidate-level

    agent_name      = Column(String, nullable=False)
    # "watcher" | "duplicate_check" | "cv_parser" | "jd_fetch" |
    # "bias_detection" | "analyzer" | "ranking" | "scheduling"

    event           = Column(String, nullable=False)
    # "cv_parsed" | "jd_fetched" | "bias_analyzed" | "threshold_decision" |
    # "shortlisted" | "rejected" | "ranked" | "scheduled" | "agent_failure" | "retry"

    status          = Column(String, nullable=False)
    # "success" | "failure" | "retrying" | "flagged_hr" | "stopped"

    message         = Column(Text, nullable=True)
    # human-readable description of what happened

    log_metadata        = Column(JSONB, nullable=True)
    # scores, reasoning, retry count, error details — anything structured

    retry_count = Column(Integer, default=0)
    error_details = Column(Text, nullable=True)

    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))