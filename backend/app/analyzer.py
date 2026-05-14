import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.skills import TECH_SKILLS


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9+#.\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_skills(text: str) -> list:
    cleaned_text = clean_text(text)
    found_skills = []

    for skill in TECH_SKILLS:
        if skill.lower() in cleaned_text:
            found_skills.append(skill)

    return sorted(list(set(found_skills)))


def analyze_sections(text: str) -> dict:
    cleaned = clean_text(text)

    sections = {
        "Contact": bool(re.search(r"\b(email|phone|linkedin|github)\b", cleaned)),
        "Skills": bool(re.search(r"\b(skills|technical skills|technologies)\b", cleaned)),
        "Projects": bool(re.search(r"\b(projects|academic projects|personal projects)\b", cleaned)),
        "Experience": bool(re.search(r"\b(experience|internship|work experience)\b", cleaned)),
        "Education": bool(re.search(r"\b(education|degree|university|college)\b", cleaned)),
        "Certifications": bool(re.search(r"\b(certifications|certificate|courses)\b", cleaned)),
    }

    section_score = round((sum(sections.values()) / len(sections)) * 100, 2)

    return {
        "sections": sections,
        "section_score": section_score
    }


def calculate_similarity_score(resume_text: str, job_description: str) -> float:
    if not resume_text.strip() or not job_description.strip():
        return 0.0

    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform([resume_text, job_description])

    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

    return round(similarity * 100, 2)


def generate_suggestions(score: float, missing_skills: list, section_data: dict) -> list:
    suggestions = []

    if score < 40:
        suggestions.append("Your resume has low similarity with the job description. Add more role-specific keywords.")
    elif score < 70:
        suggestions.append("Your resume is moderately aligned. Improve it by adding missing technical skills and project keywords.")
    else:
        suggestions.append("Your resume is well aligned with the job description. Add measurable achievements to make it stronger.")

    if missing_skills:
        suggestions.append("Add these missing skills if you genuinely know them: " + ", ".join(missing_skills[:8]))

    missing_sections = [
        section for section, present in section_data["sections"].items()
        if not present
    ]

    if missing_sections:
        suggestions.append("Your resume may be missing these important sections: " + ", ".join(missing_sections))

    suggestions.append("Include quantifiable achievements such as percentages, numbers, users, performance improvements, or project impact.")
    suggestions.append("Use clear section headings like Skills, Projects, Experience, Education, and Certifications.")

    return suggestions


def analyze_resume(resume_text: str, job_description: str) -> dict:
    cleaned_resume = clean_text(resume_text)
    cleaned_job = clean_text(job_description)

    resume_skills = extract_skills(cleaned_resume)
    job_skills = extract_skills(cleaned_job)

    matched_skills = sorted(list(set(resume_skills) & set(job_skills)))
    missing_skills = sorted(list(set(job_skills) - set(resume_skills)))

    similarity_score = calculate_similarity_score(cleaned_resume, cleaned_job)

    skill_score = 0
    if job_skills:
        skill_score = round((len(matched_skills) / len(job_skills)) * 100, 2)

    section_data = analyze_sections(resume_text)
    section_score = section_data["section_score"]

    final_score = round(
        (similarity_score * 0.5) + (skill_score * 0.3) + (section_score * 0.2),
        2
    )

    suggestions = generate_suggestions(final_score, missing_skills, section_data)

    return {
    "ats_score": final_score,
    "similarity_score": similarity_score,
    "skill_score": skill_score,
    "section_score": section_score,

    "sections": section_data["sections"],

    "resume_skills": resume_skills,
    "job_skills": job_skills,

    "matched_skills": matched_skills,
    "missing_skills": missing_skills,

    "matched_skill_count": len(matched_skills),
    "missing_skill_count": len(missing_skills),

    "resume_skill_count": len(resume_skills),
    "job_skill_count": len(job_skills),

    "skill_match_percentage": round(
        (len(matched_skills) / len(job_skills)) * 100,
        2
    ) if job_skills else 0,

    "suggestions": suggestions
}