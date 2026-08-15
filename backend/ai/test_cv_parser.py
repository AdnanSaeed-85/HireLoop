import asyncio
from backend.ai.agents.cv_parser import cv_parser_agent
from backend.ai.state import PipelineState

# load a real pdf file for testing
with open("test_cv.pdf", "rb") as f:
    cv_bytes = f.read()

state: PipelineState = {
    "candidate_id": "test-123",
    "job_id": "test-job-123",
    "application_id": "test-app-123",
    "job_role": "AI Engineer",
    "cv_bytes": cv_bytes,
    "cv_hash": "test-hash",
    "cv_text": "",
    "extracted_profile": {},
    "clean_cv": {},
    "jd_data": {},
    "score": {},
    "status": "started",
    "error": None
}

result = cv_parser_agent(state)
print("Status:", result["status"])
print()
print()
print("Extracted SUMMARY: ", result["extracted_profile"]['summary'])
print()
print()
print("Extracted SKILLS: ", result["extracted_profile"]['skills'])
print()
print()
print("Extracted EXPERIENCE: ", result["extracted_profile"]['experience'])
print()
print()
print("Extracted PROJECTS: ", result["extracted_profile"]['projects'])
print()
print()
print("Extracted CERTIFICATIONS: ", result["extracted_profile"]['certifications'])
print()
print()
print("Extracted EDUCATIONS: ", result["extracted_profile"]['education'])
print()
print()
print("Error:", result["error"])