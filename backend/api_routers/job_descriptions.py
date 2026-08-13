from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db
from backend.core.security import hash_password, verify_password, create_access_token
from backend.models.job_description import JobDescription
from backend.schemas.job_description import JDCreateRequest, JDResponse, JDUpdateRequest

router = APIRouter(prefix="/api/jd", tags=["Job_Description"])

@router.post('/create', response_model=JDResponse, status_code=201)
def jd_create(request: JDCreateRequest, db: Session = Depends(get_db)):
    new_jd = JobDescription(
        title=request.title,
        description=request.description,
        requirements=request.requirements,
        experience_years=request.experience_years,
        bias_enabled=request.bias_enabled
    )
    db.add(new_jd)
    db.commit()
    db.refresh(new_jd)
    return new_jd


@router.get('/all', response_model=list[JDResponse], status_code=200)
def jd_get_all(db: Session = Depends(get_db)):
    jobs = db.query(JobDescription).all()
    return jobs


@router.put('/update/{job_id}', response_model=JDResponse, status_code=200)
def jd_update(job_id: str, request: JDUpdateRequest, db: Session = Depends(get_db)):
    jd = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    if request.title is not None:
        jd.title = request.title
    if request.description is not None:
        jd.description = request.description
    if request.requirements is not None:
        jd.requirements = request.requirements
    if request.experience_years is not None:
        jd.experience_years = request.experience_years
    if request.bias_enabled is not None:
        jd.bias_enabled = request.bias_enabled
    if request.is_active is not None:
        jd.is_active = request.is_active

    db.commit()
    db.refresh(jd)
    return jd


@router.delete('/delete/{job_id}', status_code=200)
def delete_jd(job_id: str, db: Session = Depends(get_db)):
    jd = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")

    db.delete(jd)
    db.commit()
    return {"message": "Job description deleted successfully"}