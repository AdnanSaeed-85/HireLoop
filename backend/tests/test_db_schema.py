from backend.db import Base, create_db_and_tables
from backend.schemas.application import ApplicationResponse


def test_application_table_is_registered_and_created():
    create_db_and_tables()
    assert "applications" in Base.metadata.tables


def test_application_response_accepts_string_project_relevance():
    payload = {
        "application_id": "11111111-1111-1111-1111-111111111111",
        "candidate_id": "22222222-2222-2222-2222-222222222222",
        "job_id": "33333333-3333-3333-3333-333333333333",
        "status": "analyzed",
        "project_relevent": "['Agentic HR Voice Interviewer', 'Enterprise RAG Knowledge Base']",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }
    response = ApplicationResponse.model_validate(payload)
    assert response.project_relevent == payload["project_relevent"]
