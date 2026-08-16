from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db
from backend.schemas.candidate import CandidateResponse
from backend.models.candidate_personal_data import Candidate
from backend.models.application import Application
from backend.schemas.application import ApplicationResponse
from backend.models.setting import Setting

router = APIRouter(prefix="/api/candidate", tags=["Candidate_Section"])

@router.get('/all', response_model=list[CandidateResponse], status_code=200)
def get_all(db: Session = Depends(get_db)):
    all_data = db.query(Candidate).all()
    return all_data

@router.get('/{candidate_id}', response_model=CandidateResponse, status_code=200)
def just_one(candidate_id: str, db: Session = Depends(get_db)):
    candi = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not candi:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candi

@router.delete('/{candidate_id}', response_model=CandidateResponse, status_code=200)
def candi_del(candidate_id: str, db: Session = Depends(get_db)):
    candi = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not candi:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candi)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@router.get('/by-job/{job_id}', response_model=list[ApplicationResponse], status_code=200)
def get_by_job(job_id: str, db: Session = Depends(get_db)):
    applications = db.query(Application).filter(Application.job_id == job_id).all()
    if not applications:
        raise HTTPException(status_code=404, detail="No candidates found for this job")
    return applications

@router.get('/shortlisted/{job_id}', response_model=list[ApplicationResponse], status_code=200)
def shortlisted(job_id: str, db: Session = Depends(get_db)):
    candidates = db.query(Application).filter(
        Application.job_id == job_id, Application.status == "shortlisted"
    ).order_by(Application.overall_score.desc()).all()

    if not candidates:
        raise HTTPException(status_code=404, detail="No shortlisted candidates found for this job")

    return candidates