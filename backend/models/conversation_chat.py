from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from db import Base

class ConversationalChat(Base):
    __tablename__ = "conversational_chat"

    chat_id         = Column(UUID(as_uuid=True),
                             ForeignKey("conversational_sessions.conversation_id"), nullable=False)
    message_id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    turn_id         = Column(Integer, nullable=False)

    role            = Column(String, nullable=False)   # "user" | "assistant" | "system" | "tool"

    content         = Column(Text, nullable=False)

    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    flagged         = Column(Boolean, default=False)
    flag_reason     = Column(String, nullable=True)

    token_count     = Column(Integer, nullable=True)
    message_metadata        = Column(JSONB, nullable=True)