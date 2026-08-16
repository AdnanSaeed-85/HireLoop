from typing import TypedDict, Optional

class PipelineState(TypedDict):
    candidate_id: str
    job_id: str
    application_id: str
    job_role: str
    cv_bytes: bytes
    cv_hash: str
    cv_text: str
    extracted_profile: dict
    jd_data: dict
    score: dict
    status: str
    error: Optional[str]