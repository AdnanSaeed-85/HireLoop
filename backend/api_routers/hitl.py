from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.application import Application
from backend.schemas.application import ApplicationResponse
from backend.schemas.hitl import HITLDecisionRequest, HITLDecisionResponse
from backend.core.dependencies import get_db
from backend.models.hitl import HitlDecision


router = APIRouter(prefix="/api/hitl", tags=["HITL_Section"])


@router.get('/pending', response_model=list[ApplicationResponse], status_code=200)
def pending_function(db: Session = Depends(get_db)):
    pending_applications = db.query(Application).filter(Application.status == "pending_hitl").all()
    if not pending_applications:
        raise HTTPException(status_code=404, detail="No pending applications found")
    return pending_applications


@router.post('/decide/{application_id}', response_model=HITLDecisionResponse, status_code=201)
def respond_it(application_id: str, request: HITLDecisionRequest, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    decision = HitlDecision(
        application_id=application_id,
        hr_action=request.hr_action,
        hr_notes=request.hr_notes
    )
    db.add(decision)

    if request.hr_action == "approved_rejection":
        application.status = "rejected"
    elif request.hr_action == "manual_review":
        application.status = "manual_review"

    db.commit()
    db.refresh(decision)
    return decision