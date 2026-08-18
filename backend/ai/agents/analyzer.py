from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from backend.ai.state import PipelineState
from backend.db import SessionLocal
from backend.models.application import Application
from backend.models.setting import Setting

load_dotenv()

llm = ChatOpenAI(model='gpt-4o-mini', temperature=0)

from pydantic import BaseModel, Field
from typing import Literal


class SkillScoreSchema(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Score between 0-10 based on how well candidate skills match JD required skills")
    matched_skills: list[str] = Field(..., description="List of skills candidate has that match JD requirements")
    missing_skills: list[str] = Field(..., description="List of skills required in JD but missing from candidate CV")
    reasoning: str = Field(..., description="Detailed reasoning for this score")

class ExperienceScoreSchema(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Score between 0-10 based on experience relevance and years")
    years_found: float = Field(..., description="Total years of relevant experience found in CV")
    years_required: float = Field(..., description="Years of experience required in JD")
    reasoning: str = Field(..., description="Detailed reasoning for this score")

class ProjectScoreSchema(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Score between 0-10 based on project relevance to JD")
    relevant_projects: list[str] = Field(..., description="List of projects relevant to the JD")
    reasoning: str = Field(..., description="Detailed reasoning for this score")

class EducationScoreSchema(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Score between 0-10 based on education fit with JD")
    degree_found: str = Field(..., description="Degree found in candidate CV")
    reasoning: str = Field(..., description="Detailed reasoning for this score")

class AnalyzerSchema(BaseModel):
    skills: SkillScoreSchema = Field(..., description="Skills evaluation")
    experience: ExperienceScoreSchema = Field(..., description="Experience evaluation")
    projects: ProjectScoreSchema = Field(..., description="Projects evaluation")
    education: EducationScoreSchema = Field(..., description="Education evaluation")
    overall_reasoning: str = Field(..., description="Complete summary of why candidate is suitable or not for this role")
    recommendation: Literal["shortlist", "reject"] = Field(..., description="Final recommendation based on all scores")



def analyzer_agent(state: PipelineState) -> PipelineState:
    extracted_profile = state.get("extracted_profile")
    jd_data = state.get("jd_data")
    application_id = state.get("application_id")

    if not extracted_profile or not jd_data:
        state["error"] = "Missing extracted_profile CV or JD data"
        state["status"] = "failed"
        return state


    structured_llm = llm.with_structured_output(AnalyzerSchema, method="function_calling")
    prompt = f"""
    You are a strict and experienced Senior Hiring Manager with 15+ years of technical recruitment experience.

    Your task is to evaluate a candidate's CV against a Job Description and provide an honest, detailed, section-by-section score.

    STRICT RULES:
    - Be brutally honest. Do not inflate scores.
    - Score only based on evidence found in the CV. Do not assume or guess.
    - If a required skill is not mentioned in CV, it is missing. Period.
    - If experience years don't meet JD requirement, penalize accordingly.
    - A candidate with 1 year experience applying for a 5 year role should score low on experience.
    - Projects must be directly relevant to the JD to score high. Side projects or unrelated work scores low.
    - Education is judged on degree relevance to the role, not institution prestige.

    SCORING GUIDE:
    - 9-10: Perfect match, exceeds requirements
    - 7-8: Strong match, meets most requirements
    - 5-6: Partial match, meets some requirements
    - 3-4: Weak match, missing key requirements
    - 0-2: Poor match, does not meet requirements

    Job Description:
    {jd_data}

    Candidate CV:
    {extracted_profile}

    Evaluate every section carefully and provide your final recommendation.
    """

    try:
        result: AnalyzerSchema = structured_llm.invoke(prompt)

        total_score = result.skills.score + result.experience.score + result.projects.score + result.education.score
        overall_score = round(total_score / 40 * 10, 2)

        state["score"] = {
            "skills_score": result.skills.score,
            "skills_matched": result.skills.matched_skills,
            "skills_missing": result.skills.missing_skills,
            "skills_reasoning": result.skills.reasoning,
            
            "experience_score": result.experience.score,
            "experience_years_found": result.experience.years_found,
            "experience_years_required": result.experience.years_required,
            "experience_reasoning": result.experience.reasoning,
            
            "project_score": result.projects.score,
            "relevant_projects": result.projects.relevant_projects,
            "project_reasoning": result.projects.reasoning,
            
            "education_score": result.education.score,
            "degree_found": result.education.degree_found,
            "education_reasoning": result.education.reasoning,
            
            "overall_score": overall_score,
            "overall_reasoning": result.overall_reasoning,
            "recommendation": result.recommendation
        }
        
        # store scores in database
        db = SessionLocal()
        application = db.query(Application).filter(
            Application.application_id == application_id
        ).first()

        if application:
            application.skills_score = result.skills.score
            application.experience_score = result.experience.score
            application.project_score = result.projects.score
            application.education_score = result.education.score
            application.overall_score = result.education.score
            application.scoring_reasoning = overall_score
            application.status = "analyzed"

            # fetch threshold from settings
            setting = db.query(Setting).first()
            threshold = setting.threshold if setting else 7.0  # fallback to 7.0 if not set

            if overall_score >= threshold:
                application.status = "shortlisted"
            else:
                application.status = "pending_hitl"

            db.commit()

        db.close()
        state["status"] = "analyzed"

    except Exception as e:
        state["error"] = f"Analyzer failed: {str(e)}"
        state["status"] = "failed"
    print("Analyzer Agent running...")
    return state



if __name__ == "__main__":
    from backend.ai.agents.jd_fetch import jd_fetch_agent
    from backend.ai.agents.cv_parser import cv_parser_agent

    path = "resume_bilal.pdf"
    with open(path, "rb") as f:
        cv_bytes = f.read()

    state: PipelineState = {
        "candidate_id": "512a9cc2-83c4-4a49-9ff0-3fbb1299ed76",
        "job_id": "b3e4bdbe-f37a-483a-b7f2-f9a7737bc1ab",
        "application_id": "23fcf5a6-2c46-4b10-bc1d-b88421efd054",
        "job_role": "AI Engineer",
        "cv_bytes": cv_bytes,
        "cv_hash": "test-hash",
        "cv_text": "",
        "extracted_profile": {},
        "jd_data": {},
        "score": {},
        "status": "started",
        "error": None
    }

    cv_parser_agent(state)
    # print("Extracted profile after parser:", state.get("extracted_profile"))
    jd_fetch_agent(state)
    # print("JD Fetched after Extracted profile:", state.get("jd_data"))
    result = analyzer_agent(state)
    print()
    print()
    print()
    print("Full Result:", result["score"])