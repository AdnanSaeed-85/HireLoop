from fastapi import FastAPI
from backend.api_routers.auth import router as auth_router
from backend.api_routers.job_descriptions import router as jd_des_router
from backend.api_routers.candidates import router as candidate_router
from backend.api_routers.hitl import router as hitl_router
from backend.api_routers.applications import router as application_router
from backend.api_routers.chat import router as chat_router
from backend.api_routers.apply import router as apply_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="HireLoop", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.100.37:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(jd_des_router)
app.include_router(candidate_router)
app.include_router(hitl_router)
app.include_router(application_router)
app.include_router(chat_router)
app.include_router(apply_router)

@app.get("/")
def root():
    return {"message": "HireLoop API is running"}