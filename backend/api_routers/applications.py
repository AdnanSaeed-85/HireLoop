from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.application import Application
from schemas.application import ApplicationOutput, ApplicationResponse
from core.dependencies import get_db

router = APIRouter(prefix="/api/appliaction", tags=['Application_Section'])

