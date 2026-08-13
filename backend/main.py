from fastapi import FastAPI
from backend.api_routers.auth import router as auth_router
from backend.api_routers.job_descriptions import router as jd_des_router

app = FastAPI(title="HireLoop", version="1.0.0")

app.include_router(auth_router)
app.include_router(jd_des_router)

@app.get("/")
def root():
    return {"message": "HireLoop API is running"}