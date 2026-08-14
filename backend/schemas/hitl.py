from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class HITLDecisionRequest(BaseModel):
    hr_action: str  # "approved_rejection" | "manual_review"
    hr_notes: Optional[str] = None

class HITLDecisionResponse(BaseModel):
    decision_id: str
    application_id: str
    hr_action: str
    hr_notes: Optional[str] = None
    decided_at: datetime

    class Config:
        from_attributes = True