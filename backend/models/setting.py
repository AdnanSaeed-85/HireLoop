from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from backend.db import Base

class Setting(Base):
    __tablename__ = "settings"

    setting_id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hr_admin_id     = Column(UUID(as_uuid=True), ForeignKey("hr_admins.id"), nullable=False)

    # ── Scoring ───────────────────────────────────────────────
    threshold       = Column(Float, nullable=False, default=7.0)
    # overall score cutoff e.g. 7.0 out of 10

    # ── OpenAI ────────────────────────────────────────────────
    openai_api_key  = Column(String, nullable=True)
    # store encrypted — never raw
    openai_model    = Column(String, nullable=True, default="gpt-4o")
    # "gpt-4o" | "gpt-4o-mini" | "gpt-4-turbo" | "gpt-5.6-luna"

    # ── Google OAuth ──────────────────────────────────────────
    google_access_token  = Column(String, nullable=True)
    google_refresh_token = Column(String, nullable=True)
    google_token_expiry  = Column(DateTime(timezone=True), nullable=True)

    # ── Timestamps ────────────────────────────────────────────
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                             onupdate=lambda: datetime.now(timezone.utc))