from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db
from backend.core.security import hash_password, verify_password, create_access_token
from backend.models.hr_admin import HrAdmin
from backend.schemas.auth import HrRegisterRequest, HrLoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(request: HrRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(HrAdmin).filter(HrAdmin.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_hr = HrAdmin(
        name=request.name,
        email=request.email,
        password=hash_password(request.password)
    )
    db.add(new_hr)
    db.commit()
    db.refresh(new_hr)
    
    token = create_access_token({"sub": str(new_hr.id), "email": new_hr.email})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(request: HrLoginRequest, db: Session = Depends(get_db)):
    hr = db.query(HrAdmin).filter(HrAdmin.email == request.email).first()
    if not hr or not verify_password(request.password, hr.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(hr.id), "email": hr.email})
    return TokenResponse(access_token=token)