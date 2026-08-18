from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db, get_current_user
from backend.models.setting import Setting
from backend.schemas.settings import SettingsUpdate, SettingsResponse

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/", response_model=SettingsResponse, status_code=200)
def get_settings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    setting = db.query(Setting).filter(Setting.hr_admin_id == current_user["sub"]).first()
    if not setting:
        setting = Setting(hr_admin_id=current_user["sub"])
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.put("/update", response_model=SettingsResponse, status_code=200)
def update_settings(request: SettingsUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    setting = db.query(Setting).filter(Setting.hr_admin_id == current_user["sub"]).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found")

    if request.threshold is not None:
        setting.threshold = request.threshold
    if request.openai_api_key is not None:
        setting.openai_api_key = request.openai_api_key
    if request.openai_model is not None:
        setting.openai_model = request.openai_model
    if request.google_access_token is not None:
        setting.google_access_token = request.google_access_token
    if request.google_refresh_token is not None:
        setting.google_refresh_token = request.google_refresh_token

    db.commit()
    db.refresh(setting)
    return setting