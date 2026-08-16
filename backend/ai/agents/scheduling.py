from googleapiclient.discovery import build
from google.oauth2 import service_account
from backend.ai.state import PipelineState
from backend.db import SessionLocal
from backend.models.candidate_personal_data import Candidate
from backend.models.application import Application
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os
from backend.models.hr_admin import HrAdmin

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/calendar"]
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# ------------------------------------- Email Sender -----------------------------------

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
    except Exception as e:
        print(f"Email sending failed: {str(e)}")

# ------------------------------------- Calendar Booking -----------------------------------

def book_calendar_event(candidate_name: str, candidate_email: str, hr_email: str, job_title: str, interview_datetime: datetime):
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        service = build("calendar", "v3", credentials=creds)

        event = {
            "summary": f"Interview — {candidate_name} for {job_title}",
            "description": f"Interview scheduled for {candidate_name} applying for {job_title}",
            "start": {
                "dateTime": interview_datetime.isoformat(),
                "timeZone": "Asia/Karachi"
            },
            "end": {
                "dateTime": (interview_datetime + timedelta(hours=1)).isoformat(),
                "timeZone": "Asia/Karachi"
            },
            "attendees": [
                {"email": hr_email},
                {"email": candidate_email}
            ]
        }

        event = service.events().insert(calendarId=CALENDAR_ID, body=event, sendUpdates="all").execute()
        return event.get("htmlLink")
    except Exception as e:
        print(f"Calendar booking failed: {str(e)}")
        return None

# ------------------------------------- Rejection Notification -----------------------------------

def send_rejection_notification(state: PipelineState) -> PipelineState:
    candidate_id = state.get("candidate_id")

    try:
        db = SessionLocal()
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        db.close()

        if not candidate:
            state["error"] = "Candidate not found for rejection email"
            state["status"] = "failed"
            return state

        subject = "Application Update — HireLoop"
        body = f"""
        <html>
        <body>
            <p>Dear {candidate.name},</p>
            <p>Thank you for applying. After careful review, we regret to inform you that your application 
            does not match our current requirements.</p>
            <p>We appreciate your interest and wish you the best in your job search.</p>
            <br>
            <p>Best regards,<br>HireLoop Hiring Team</p>
        </body>
        </html>
        """
        send_email(candidate.email, subject, body)
        state["status"] = "rejected_notified"

    except Exception as e:
        state["error"] = f"Rejection notification failed: {str(e)}"
        state["status"] = "failed"

    return state

# ------------------------------------- Interview Notification -----------------------------------

def send_interview_notification(state: PipelineState) -> PipelineState:
    candidate_id = state.get("candidate_id")
    jd_data = state.get("jd_data")

    try:
        db = SessionLocal()
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        hr = db.query(HrAdmin).first()
        db.close()

        if not candidate or not hr:
            state["error"] = "Candidate or HR not found"
            state["status"] = "failed"
            return state

        hr_email = hr.email
        interview_datetime = datetime.now(timezone.utc) + timedelta(days=3)  # default 3 days from now

        job_title = jd_data.get("title", "the position")

        # book calendar event
        calendar_link = book_calendar_event(
            candidate.name,
            candidate.email,
            hr_email,
            job_title,
            interview_datetime
        )

        # send email to candidate
        candidate_subject = f"Interview Invitation — {job_title}"
        candidate_body = f"""
        <html>
        <body>
            <p>Dear {candidate.name},</p>
            <p>Congratulations! We are pleased to invite you for an interview for the position of <b>{job_title}</b>.</p>
            <p><b>Date & Time:</b> {interview_datetime.strftime('%B %d, %Y at %I:%M %p')}</p>
            <p>You will receive a calendar invitation shortly.</p>
            <br>
            <p>Best regards,<br>HireLoop Hiring Team</p>
        </body>
        </html>
        """
        send_email(candidate.email, candidate_subject, candidate_body)

        # send confirmation to HR
        hr_subject = f"Interview Scheduled — {candidate.name} for {job_title}"
        hr_body = f"""
        <html>
        <body>
            <p>Interview has been scheduled successfully.</p>
            <p><b>Candidate:</b> {candidate.name}</p>
            <p><b>Position:</b> {job_title}</p>
            <p><b>Date & Time:</b> {interview_datetime.strftime('%B %d, %Y at %I:%M %p')}</p>
            <p><b>Calendar Link:</b> <a href="{calendar_link}">View Event</a></p>
        </body>
        </html>
        """
        send_email(hr_email, hr_subject, hr_body)

        state["status"] = "interview_scheduled"

    except Exception as e:
        state["error"] = f"Interview notification failed: {str(e)}"
        state["status"] = "failed"

    return state

def send_hr_notification(state: PipelineState) -> PipelineState:
    candidate_id = state.get("candidate_id")
    application_id = state.get("application_id")
    score = state.get("score", {})
    jd_data = state.get("jd_data", {})

    try:
        db = SessionLocal()
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        hr = db.query(HrAdmin).first()
        db.close()

        if not candidate:
            state["error"] = "Candidate not found"
            state["status"] = "failed"
            return state

        if not hr:
            state["error"] = "HR not found"
            state["status"] = "failed"
            return state

        hr_email = hr.email
        approve_link = f"http://127.0.0.1:8000/api/hitl/decide/{application_id}?action=approved_rejection"
        review_link = f"http://127.0.0.1:8000/api/hitl/decide/{application_id}?action=manual_review"

        subject = f"HireLoop — Candidate Review Required: {candidate.name}"
        body = f"""
        <html>
        <body>
            <h2>Candidate Scored Below Threshold</h2>
            <p><b>Candidate:</b> {candidate.name}</p>
            <p><b>Email:</b> {candidate.email}</p>
            <p><b>Position:</b> {jd_data.get('title', 'N/A')}</p>
            <hr>
            <h3>Scores:</h3>
            <p><b>Skills Score:</b> {score.get('skills_score', 0)}/10</p>
            <p><b>Experience Score:</b> {score.get('experience_score', 0)}/10</p>
            <p><b>Project Score:</b> {score.get('project_score', 0)}/10</p>
            <p><b>Education Score:</b> {score.get('education_score', 0)}/10</p>
            <p><b>Overall Score:</b> {score.get('overall_score', 0)}/10</p>
            <hr>
            <h3>Reasoning:</h3>
            <p>{score.get('reasoning', 'N/A')}</p>
            <hr>
            <h3>Your Decision:</h3>
            <a href="{approve_link}" style="background-color:#e74c3c;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Approve Rejection</a>
            &nbsp;&nbsp;
            <a href="{review_link}" style="background-color:#3498db;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Review Manually</a>
        </body>
        </html>
        """

        send_email(hr_email, subject, body)
        state["status"] = "pending_hitl"

    except Exception as e:
        state["error"] = f"HR notification failed: {str(e)}"
        state["status"] = "failed"

    return state