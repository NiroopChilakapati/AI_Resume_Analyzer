import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.pdf_reader import extract_text_from_pdf
from app.analyzer import analyze_resume
from app.ai_suggestions import generate_ai_suggestions

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://YOUR_VERCEL_URL"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"message": "AI Resume Analyzer API is running"}


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    file_path = os.path.join(UPLOAD_DIR, resume.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    resume_text = extract_text_from_pdf(file_path)

    result = analyze_resume(resume_text, job_description)

    ai_feedback = generate_ai_suggestions(
        resume_text=resume_text,
        job_description=job_description,
        missing_skills=result["missing_skills"],
        ats_score=result["ats_score"]
    )

    result["ai_feedback"] = ai_feedback

    return result