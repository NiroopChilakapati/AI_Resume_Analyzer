import { useState } from 'react';
import api from '../api/axios';
import ResultCard from '../components/ResultCard';

export default function Home() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!resume) {
      setError('Please upload a resume PDF.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter job description.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('job_description', jobDescription);

      const res = await api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h1>AI Resume Analyzer</h1>
          <p>
            Upload your resume and compare it with a job description to get ATS
            score and improvement suggestions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          <div className="grid-2">
            <div>
              <label>Upload Resume PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>

            <div>
              <label>Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                rows="8"
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </form>

        <ResultCard result={result} />
      </div>
    </div>
  );
}