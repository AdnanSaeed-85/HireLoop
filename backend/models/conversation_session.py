from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from backend.db import Base


class ConversationalSession(Base):
    __tablename__ = "conversational_sessions"

    # ── Identity ──────────────────────────────────────────────
    conversation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("hr_admins.id"), nullable=False)

    # ── Lifecycle ─────────────────────────────────────────────
    status          = Column(String, nullable=False, default="active")
    # "active" | "ended"

    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                             onupdate=lambda: datetime.now(timezone.utc))
    ended_at        = Column(DateTime(timezone=True), nullable=True)

    # ── AI Model Info ─────────────────────────────────────────
    model_name      = Column(String, nullable=True)    # "gpt-4o" | "claude-sonnet"
    agent_id        = Column(String, nullable=True)    # which agent/graph handled it

    # ── Analytics ─────────────────────────────────────────────
    message_count   = Column(Integer, default=0)
    total_tokens    = Column(Integer, nullable=True)

    # ── Flexible overflow ─────────────────────────────────────
    message_metadata        = Column(JSONB, nullable=True)