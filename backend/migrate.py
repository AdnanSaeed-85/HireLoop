from db import Base, engine
from models.candidate_personal_data import Candidate
from models.candidate_cv_data import CandidateProfile
from models.job_description import JobDescription
from models.application import Application
from models.hitl import HitlDecision
from models.log_by_supervisor import SupervisorLog
from models.hr_admin import HrAdmin
from models.setting import Setting
from models.conversation_session import ConversationalSession
from models.conversation_chat import ConversationalChat

print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)
print("All tables created successfully.")