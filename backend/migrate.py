from backend.db import Base, engine
from backend.models.candidate_personal_data import Candidate
from backend.models.candidate_cv_data import CandidateProfile
from backend.models.job_description import JobDescription
from backend.models.application import Application
from backend.models.hitl import HitlDecision
from backend.models.log_by_supervisor import SupervisorLog
from backend.models.hr_admin import HrAdmin
from backend.models.setting import Setting
from backend.models.conversation_session import ConversationalSession
from backend.models.conversation_chat import ConversationalChat

print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)
print("All tables created successfully.")