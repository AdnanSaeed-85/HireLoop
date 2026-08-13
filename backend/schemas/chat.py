from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ChatSessionCreate(BaseModel):
    candidate_id: UUID

class ChatMessageRequest(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    message_id: str
    chat_id: str
    role: str
    content: str
    turn_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    conversation_id: str
    user_id: str
    candidate_id: Optional[str] = None
    status: str
    created_at: datetime
    messages: Optional[List[ChatMessageResponse]] = []

    class Config:
        from_attributes = True