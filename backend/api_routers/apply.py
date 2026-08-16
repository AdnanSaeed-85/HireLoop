from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db
from backend.models.candidate_personal_data import Candidate
from backend.models.application import Application
from backend.models.job_description import JobDescription
from backend.ai.state import PipelineState
from backend.ai.graph import pipeline
import hashlib


router = APIRouter(prefix="/api/apply", tags=["Candidate_Application"])

@router.post("/submit", status_code=201)
async def submit_application(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    linkedin: str = Form(None),
    github: str = Form(None),
    personal_portfolio: str = Form(None),
    address: str = Form(None),
    job_id: str = Form(...),
    cv: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # validate file type
    if not cv.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # read cv bytes and generate hash
    cv_bytes = await cv.read()
    cv_hash = hashlib.sha256(cv_bytes).hexdigest()

    # validate job exists, if job and status of job is_active then candidate is able to apply otherwise not.
    job = db.query(JobDescription).filter(JobDescription.job_id == job_id, JobDescription.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or inactive")

    # check duplicate by email
    existing = db.query(Candidate).filter(Candidate.email == email).first()

    if existing:
        # update existing candidate
        existing.name = name
        existing.phone = phone
        existing.linkedin = linkedin
        existing.github = github
        existing.personal_portfolio = personal_portfolio
        existing.address = address
        existing.cv_hash = cv_hash
        candidate = existing
    else:
        # check duplicate by cv hash
        hash_exists = db.query(Candidate).filter(Candidate.cv_hash == cv_hash).first()
        if hash_exists:
            raise HTTPException(status_code=400, detail="This CV has already been submitted")

        # create new candidate
        candidate = Candidate(
            name=name,
            email=email,
            phone=phone,
            linkedin=linkedin,
            github=github,
            personal_portfolio=personal_portfolio,
            address=address,
            cv_hash=cv_hash
        )
        db.add(candidate)
        db.flush()

    # create application
    application = Application(
        candidate_id=candidate.candidate_id,
        job_id=job_id,
        status="pending"
    )
    db.add(application)
    db.commit()

    # trigger agent pipeline here next
    print(f"New application received: {name} for {job.title}")

    # trigger cv parser agent
    state: PipelineState = {
        "candidate_id": str(candidate.candidate_id),
        "job_id": job_id,
        "application_id": str(application.application_id),
        "job_role": job.title,
        "cv_bytes": cv_bytes,
        "cv_hash": cv_hash,
        "cv_text": "",
        "extracted_profile": {},
        "clean_cv": {},
        "jd_data": {},
        "score": {},
        "status": "started",
        "error": None
    }

    pipeline.invoke(state)

    return {"message": "Application submitted successfully", "candidate_id": str(candidate.candidate_id)}