from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class SettingsUpdate(BaseModel):
    threshold: Optional[float] = None
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None

class SettingsResponse(BaseModel):
    setting_id: UUID
    hr_admin_id: UUID
    threshold: float
    openai_model: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True