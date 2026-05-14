function getScoreColor(score) {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#eab308';
  return '#dc2626';
}

function ProgressCard({ title, score }) {
  return (
    <div className="result-box">
      <h2>{title}</h2>

      <div
        style={{
          width: '120px',
          height: '120px',
          margin: '20px auto',
          borderRadius: '50%',
          background: `conic-gradient(
            ${getScoreColor(score)} ${score * 3.6}deg,
            #e5e7eb 0deg
          )`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '22px'
          }}
        >
          {score}%
        </div>
      </div>
    </div>
  );
}

export default function ResultCard({ result }) {
  if (!result) return null;

  function downloadReport() {
    const report = `
AI RESUME ANALYZER REPORT

ATS Score: ${result.ats_score}%
Similarity Score: ${result.similarity_score}%
Skill Score: ${result.skill_score}%
Section Score: ${result.section_score}%

RESUME SECTIONS:
${Object.entries(result.sections)
  .map(([section, present]) => `${section}: ${present ? 'Present' : 'Missing'}`)
  .join('\n')}

MATCHED SKILLS:
${result.matched_skills.join(', ') || 'No matched skills'}

MISSING SKILLS:
${result.missing_skills.join(', ') || 'No missing skills'}

AI FEEDBACK:
${result.ai_feedback || 'No AI feedback generated'}
`;

    const blob = new Blob([report], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'resume-analysis-report.txt';

    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="results">
      {/* Main Score Cards */}
      <div className="grid-2">
        <ProgressCard
          title="ATS Score"
          score={result.ats_score}
        />

        <ProgressCard
          title="Similarity Score"
          score={result.similarity_score}
        />
      </div>

      <div className="grid-2 skills-section">
        <ProgressCard
          title="Skill Score"
          score={result.skill_score}
        />

        <ProgressCard
          title="Section Score"
          score={result.section_score}
        />
      </div>

      {/* Download */}
      <button onClick={downloadReport}>
        Download Report
      </button>

      {/* Skill Match Analytics */}
      <div className="suggestion-box skills-section">
        <h2>Skill Match Analytics</h2>

        <div style={{ marginTop: '25px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}
          >
            <span>Matched Skills</span>

            <strong>
              {result.skill_match_percentage ||
                result.skill_score ||
                0}
              %
            </strong>
          </div>

          <div
            style={{
              width: '100%',
              height: '22px',
              background: '#e5e7eb',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${
                  result.skill_match_percentage ||
                  result.skill_score ||
                  0
                }%`,
                height: '100%',
                background:
                  (result.skill_match_percentage ||
                    result.skill_score ||
                    0) >= 70
                    ? '#16a34a'
                    : (result.skill_match_percentage ||
                        result.skill_score ||
                        0) >= 40
                    ? '#eab308'
                    : '#dc2626',
                transition: '0.4s'
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: '25px',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}
        >
          <div className="result-box">
            <h2>Resume Skills</h2>

            <p className="score">
              {result.resume_skills?.length || 0}
            </p>
          </div>

          <div className="result-box">
            <h2>Job Skills</h2>

            <p className="score">
              {result.job_skills?.length || 0}
            </p>
          </div>

          <div className="result-box">
            <h2>Matched</h2>

            <p className="score">
              {result.matched_skills?.length || 0}
            </p>
          </div>

          <div className="result-box">
            <h2>Missing</h2>

            <p className="score">
              {result.missing_skills?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Resume Sections */}
      <div className="suggestion-box skills-section">
        <h2>Resume Section Analysis</h2>

        <div className="tags">
          {Object.entries(result.sections).map(
            ([section, present]) => (
              <span
                key={section}
                className={`tag ${
                  present ? 'green' : 'red'
                }`}
              >
                {present ? '✓' : '✗'} {section}
              </span>
            )
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="grid-2 skills-section">
        <div className="skill-box">
          <h2>Matched Skills</h2>

          <div className="tags">
            {result.matched_skills.length === 0 ? (
              <p>No matched skills found.</p>
            ) : (
              result.matched_skills.map((skill, index) => (
                <span key={index} className="tag green">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="skill-box">
          <h2>Missing Skills</h2>

          <div className="tags">
            {result.missing_skills.length === 0 ? (
              <p>No missing skills.</p>
            ) : (
              result.missing_skills.map((skill, index) => (
                <span key={index} className="tag red">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="suggestion-box skills-section">
        <h2>Suggestions</h2>

        {result.suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion">
            {suggestion}
          </div>
        ))}
      </div>

      {/* AI Feedback */}
      <div className="suggestion-box skills-section">
        <h2>AI Resume Feedback</h2>

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.7',
            fontSize: '15px'
          }}
        >
          {result.ai_feedback}
        </pre>
      </div>
    </div>
  );
}