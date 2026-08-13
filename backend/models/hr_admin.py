from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from backend.db import Base

class HrAdmin(Base):
    __tablename__ = "hr_admins"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String, nullable=False)
    role       = Column(String, nullable=False, default="hr")  # "hr" | "admin"
    email      = Column(String, nullable=False, unique=True)
    password   = Column(String, nullable=False)   # bcrypt hash
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))