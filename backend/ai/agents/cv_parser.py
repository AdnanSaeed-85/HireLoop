from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
from backend.ai.state import PipelineState
import pdfplumber
import io
from backend.db import SessionLocal
from backend.models.candidate_cv_data import CandidateProfile

load_dotenv()

llm = ChatOpenAI(model='gpt-4o-mini', temperature=0)

# ------------------------------------- Pydantic Schemas -----------------------------------

class SkillSchema(BaseModel):
    technical: List[str]
    soft: Optional[List[str]] = None

class ExperienceSchema(BaseModel):
    company: str = Field(..., description="add companies names here")
    role: str
    duration: str
    description: str

class ProjectSchema(BaseModel):
    name: str
    description: str
    technologies: List[str]

class CVParserSchema(BaseModel):
    summary: Optional[str] = None
    skills: SkillSchema
    experience: List[ExperienceSchema]
    n_exp: int = Field(..., description="add total number of experience here")
    projects: List[ProjectSchema]
    certifications: Optional[List[str]] = None
    education: Optional[str] = None

# ------------------------------------- PDF Text Extraction -----------------------------------

def extract_text_from_pdf(cv_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(cv_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    if text.strip():
        return text
    return ""

# ------------------------------------- CV Parser Agent -----------------------------------

def cv_parser_agent(state: PipelineState) -> PipelineState:
    cv_bytes = state.get("cv_bytes")

    if not cv_bytes:
        state["error"] = "CV bytes not found in state"
        state["status"] = "failed"
        return state

    # extract raw text from pdf
    cv_text = extract_text_from_pdf(cv_bytes)

    if not cv_text.strip():
        state["error"] = "Could not extract text from CV"
        state["status"] = "failed"
        return state

    state["cv_text"] = cv_text

    # structured extraction using LLM
    structured_llm = llm.with_structured_output(CVParserSchema, method="function_calling")

    prompt = f"""
    You are an expert CV parser. Extract all professional information from the CV below.
    Extract only professional data — skills, experience, projects, certifications, education and add total number of experience in n_exp.
    Do not extract personal info like name, email, phone, address.

    CV:
    {cv_text}
    """
    result: CVParserSchema = structured_llm.invoke(prompt)
    state["extracted_profile"] = result.model_dump()
    state["status"] = "cv_parsed"

    try:
        db = SessionLocal()
        profile = CandidateProfile(
            candidate_id=state["candidate_id"],
            skills=str(result.skills.model_dump()),
            experience=str([e.model_dump() for e in result.experience]),
            projects=str([p.model_dump() for p in result.projects]),
            certifications=str(result.certifications),
            education=result.education,
            n_exp=result.n_exp,
            raw_text=cv_text,
        )
        db.add(profile)
        db.commit()
        db.close()
    except Exception as e:
        state["error"] = f"DB storage failed: {str(e)}"
        state["status"] = "failed"

    return state


# def main():
#     path = "cv.pdf"
#     with open(path, "rb") as f:
#         cv_bytes = f.read()

#     state: PipelineState = {
#         "candidate_id": "test-123",
#         "job_id": "test-job-123",
#         "application_id": "test-app-123",
#         "job_role": "AI Engineer",
#         "cv_bytes": cv_bytes,
#         "cv_hash": "test-hash",
#         "cv_text": "",
#         "extracted_profile": {},
#         "clean_cv": {},
#         "jd_data": {},
#         "score": {},
#         "status": "started",
#         "error": None
#     }

#     cv_parser_agent(state)
#     print("Status:", state['status'])
#     print("cv_bytes:", state['cv_bytes'][:20])
#     print("cv_text:", state['cv_text'][:50])
#     print("extracted_profile:", state['extracted_profile'])


# if __name__ == "__main__":
#     main()