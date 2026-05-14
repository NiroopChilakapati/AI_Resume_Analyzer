import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("GEMINI_API_KEY not found. Check your .env file.")

client = genai.Client(api_key=api_key)


def generate_ai_suggestions(
    resume_text: str,
    job_description: str,
    missing_skills: list,
    ats_score: float
) -> str:
    prompt = f"""
You are an expert ATS resume reviewer.

ATS Score: {ats_score}

Missing Skills:
{", ".join(missing_skills)}

Resume Text:
{resume_text[:1800]}

Job Description:
{job_description[:1200]}

Give practical improvement suggestions in this format:

1. Resume Summary Improvement:
2. Skills Section Improvement:
3. Project/Experience Improvement:
4. Missing Keywords to Add:
5. Final Advice:

Keep it simple, clear, and student-friendly.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:
        print("Gemini error:", e)
        return f"AI suggestions could not be generated. Error: {str(e)}"