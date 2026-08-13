from fastapi import FastAPI
from backend.api_routers.auth import router as auth_router

app = FastAPI(title="HireLoop", version="1.0.0")

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "HireLoop API is running"}