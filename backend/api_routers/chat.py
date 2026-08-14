from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db, get_current_user
from backend.models.conversation_session import ConversationalSession
from backend.models.conversation_chat import ConversationalChat
from backend.schemas.chat import ChatSessionCreate, ChatMessageRequest, ChatMessageResponse, ChatSessionResponse

router = APIRouter(prefix="/api/chat", tags=["Chat_Section"])

@router.post('/session/start/{candidate_id}', response_model=ChatSessionResponse, status_code=201)
def start_session(candidate_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    session = ConversationalSession(
        user_id=current_user["sub"],
        status="active",
        message_metadata={"candidate_id": candidate_id}
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post('/session/{session_id}/resume', status_code=200)
def resume_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ConversationalSession).filter(ConversationalSession.conversation_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "active"
    db.commit()
    return {"message": "Session resumed"}

@router.post('/session/{session_id}/message', response_model=ChatMessageResponse, status_code=201)
def send_message(session_id: str, request: ChatMessageRequest, db: Session = Depends(get_db)):
    session = db.query(ConversationalSession).filter(ConversationalSession.conversation_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    turn_id = session.message_count + 1

    message = ConversationalChat(
        chat_id=session_id,
        role="user",
        content=request.content,
        turn_id=turn_id
    )
    db.add(message)
    session.message_count = turn_id
    db.commit()
    db.refresh(message)
    return message

@router.get('/session/{session_id}/history', response_model=list[ChatMessageResponse], status_code=200)
def get_history(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(ConversationalChat).filter(ConversationalChat.chat_id == session_id).all()
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    return messages

@router.get('/sessions/all', response_model=list[ChatSessionResponse], status_code=200)
def get_all_sessions(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    sessions = db.query(ConversationalSession).filter(ConversationalSession.user_id == current_user["sub"]).all()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")
    return sessions

@router.delete('/session/{session_id}', status_code=200)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ConversationalSession).filter(ConversationalSession.conversation_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}

@router.put('/session/{session_id}/rename', status_code=200)
def rename_session(session_id: str, request: ChatSessionCreate, db: Session = Depends(get_db)):
    session = db.query(ConversationalSession).filter(ConversationalSession.conversation_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.commit()
    return {"message": "Session renamed successfully"}

@router.post('/session/{session_id}/star', status_code=200)
def star_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ConversationalSession).filter(ConversationalSession.conversation_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    current = session.message_metadata or {}
    current["starred"] = not current.get("starred", False)
    session.message_metadata = current
    db.commit()
    return {"message": "Session star toggled", "starred": current["starred"]}