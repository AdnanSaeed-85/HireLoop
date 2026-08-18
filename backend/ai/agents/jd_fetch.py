from backend.ai.state import PipelineState
from backend.db import SessionLocal
from backend.models.job_description import JobDescription

def jd_fetch_agent(state: PipelineState) -> PipelineState:
    job_id = state.get("job_id")

    if not job_id:
        state["error"] = "job_id not found in state"
        state["status"] = "failed"
        return state

    try:
        db = SessionLocal()
        jd = db.query(JobDescription).filter(JobDescription.job_id == job_id).first()
        db.close()

        if not jd:
            state["error"] = f"Job description not found for job_id: {job_id}"
            state["status"] = "failed"
            return state

        state["jd_data"] = {
            "job_id": str(jd.job_id),
            "title": jd.title,
            "description": jd.description,
            "requirements": jd.requirements,
            "experience_years": jd.experience_years,
        }
        state["status"] = "jd_fetched"

    except Exception as e:
        state["error"] = f"JD fetch failed: {str(e)}"
        state["status"] = "failed"
    print("JD Fetch Agent running...")

    return state


# if __name__ == "__main__":
#     from backend.ai.state import PipelineState
    
#     state: PipelineState = {
#         "candidate_id": "test-123",
#         "job_id": "5d5fb998-6146-452f-a18a-d3d70d79a8e2",
#         "application_id": "test-app-123",
#         "job_role": "AI Engineer",
#         "cv_bytes": b"",
#         "cv_hash": "test-hash",
#         "cv_text": "",
#         "extracted_profile": {},
#         "clean_cv": {},
#         "jd_data": {},
#         "score": {},
#         "status": "started",
#         "error": None
#     }

#     result = jd_fetch_agent(state)
#     print("Status:", result["job_id"])
#     print("Status:", result["status"])
#     print("JD Data:", result["jd_data"])
#     print("Error:", result["error"])