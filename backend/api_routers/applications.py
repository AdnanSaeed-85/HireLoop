from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.application import Application
from backend.schemas.application import ApplicationOutput, ApplicationResponse
from backend.core.dependencies import get_db

router = APIRouter(prefix="/api/application", tags=['Application_Section'])

@router.get('/all', response_model=list[ApplicationResponse], status_code=200)
def get_all(db: Session = Depends(get_db)):
    app = db.query(Application).all()
    return app

@router.get('/{application_id}', response_model=ApplicationResponse, status_code=200)
def get_one(application_id: str, db: Session = Depends(get_db)):
    single_id = db.query(Application).filter(Application.application_id == application_id).first()
    if not single_id:
        raise HTTPException(status_code=404, detail="Application not found!")
    return single_id

