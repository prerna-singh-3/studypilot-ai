"use client";

import { FormEvent, useState } from "react";
import type { StudyPlan } from "@/lib/study-plan";

export default function Home() {
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [weakTopics, setWeakTopics] = useState("");

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setPlan(null);

    const subjectList = subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);

    const weakTopicList = weakTopics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    const hours = Number(studyHours);

    if (subjectList.length === 0) {
      setError("Please enter at least one subject.");
      return;
    }

    if (!examDate) {
      setError("Please select your exam date.");
      return;
    }

    if (!studyHours || Number.isNaN(hours) || hours <= 0 || hours > 16) {
      setError("Study hours must be between 1 and 16.");
      return;
    }

    if (weakTopicList.length === 0) {
      setError("Please enter at least one weak topic.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects: subjectList,
          examDate,
          dailyHours: hours,
          weakTopics: weakTopicList,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate your study plan."
        );
      }

      setPlan(data.plan);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />

        <div className="hero-content">
          <div className="brand-pill">
            <span className="brand-dot" />
            STUDYPILOT AI
          </div>

          <p className="eyebrow">PERSONALIZED LEARNING, POWERED BY AI</p>

          <h1>
            Your study plan,
            <br />
            <span>built with AI.</span>
          </h1>

          <p className="hero-description">
            Turn your subjects, exam date, available time, and weak topics
            into a focused study roadmap tailored specifically for you.
          </p>
        </div>
      </section>

      <section className="planner-section">
        <div className="planner-card">
          <div className="section-heading">
            <div className="section-number">01</div>

            <div>
              <p className="eyebrow">YOUR INPUT</p>
              <h2>Build your study plan</h2>
              <p>
                Give StudyPilot a few details and let AI organize your
                preparation.
              </p>
            </div>
          </div>

          <form onSubmit={generatePlan} className="planner-form">
            <div className="form-group">
              <label htmlFor="subjects">Subjects</label>

              <input
                id="subjects"
                type="text"
                value={subjects}
                onChange={(event) => setSubjects(event.target.value)}
                placeholder="Data Structures, DBMS, Digital Electronics"
                required
              />

              <small>Separate multiple subjects with commas.</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="examDate">Exam date</label>

                <input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(event) => setExamDate(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="studyHours">Study hours / day</label>

                <input
                  id="studyHours"
                  type="number"
                  min="1"
                  max="16"
                  step="1"
                  value={studyHours}
                  onChange={(event) => setStudyHours(event.target.value)}
                  placeholder="4"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="weakTopics">Weak topics</label>

              <input
                id="weakTopics"
                type="text"
                value={weakTopics}
                onChange={(event) => setWeakTopics(event.target.value)}
                placeholder="Trees, SQL joins, Karnaugh maps"
                required
              />

              <small>
                Tell AI which topics need the most attention.
              </small>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <div className="error-icon">!</div>

                <div>
                  <strong>Unable to generate plan</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="generate-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Generating your plan...
                </>
              ) : (
                <>
                  Generate study plan
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {loading && (
        <section className="result-section" aria-live="polite">
          <div className="loading-card">
            <div className="loading-animation">
              <span />
              <span />
              <span />
            </div>

            <h2>StudyPilot is thinking...</h2>

            <p>
              Gemini is analyzing your subjects, exam date, available
              time, and weak topics.
            </p>
          </div>
        </section>
      )}

      {plan && !loading && (
        <section className="result-section" aria-live="polite">
          <div className="result-header">
            <div>
              <p className="eyebrow">02 · AI GENERATED</p>

              <h2>Your personalized roadmap</h2>

              <p className="result-summary">{plan.summary}</p>
            </div>

            <div className="ai-badge">
              <span className="ai-badge-dot" />
              AI PLAN
            </div>
          </div>

          <div className="plan-grid">
            {plan.days.map((day, dayIndex) => (
              <article key={day.day} className="plan-card">
                <div className="plan-card-top">
                  <div className="day-number">
                    {String(dayIndex + 1).padStart(2, "0")}
                  </div>

                  <span className="day-label">{day.day}</span>
                </div>

                <div className="plan-card-content">
                  <p className="focus-label">FOCUS</p>

                  <h3>{day.focus}</h3>

                  <div className="task-list">
                    {day.tasks.map((task, taskIndex) => (
                      <div
                        className="task-item"
                        key={`${day.day}-${taskIndex}`}
                      >
                        <div className="task-check">✓</div>

                        <p>{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <span>StudyPilot AI</span>
        <span>Personalized learning, simplified.</span>
      </footer>
    </main>
  );
}