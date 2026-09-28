# StudyPilot AI

> Your study plan, built with AI.

StudyPilot AI is an AI-powered study planning assistant that converts a student's subjects, exam date, available study time, and weak topics into a personalized study roadmap. It is designed for students who need a practical and structured preparation plan instead of manually deciding what to study each day.

## Live Demo

https://studypilot-ai-khaki.vercel.app/

## GitHub Repository

https://github.com/prerna-singh-3/studypilot-ai

---

## Problem

Students often know what they need to study but struggle to decide:

- What should I study first?
- Which weak topics need more attention?
- How should I divide my available time?
- What should I revise before the exam?

StudyPilot AI addresses this by using an LLM to transform the student's inputs into a focused, day-by-day study plan.

---

## Features

- Personalized AI-generated study plans
- Subject and weak-topic prioritization
- Exam-date based planning
- Daily study-time allocation
- Structured learning, practice, and revision tasks
- Input validation with Zod
- API error handling and user-friendly failure states
- Responsive interface for desktop and mobile
- Accessible form controls and semantic HTML
- Production deployment with Vercel
- Automated unit/component tests with Vitest and Testing Library

---

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- CSS
- Google Gemini API
- Zod
- Vitest
- Testing Library
- Vercel
- GitHub

---

## Architecture

The application follows a simple frontend-to-server architecture:

```text
User
  |
  v
StudyPilot UI
  |
  | POST /api/generate
  v
Next.js API Route
  |
  v
Google Gemini API
  |
  v
Structured AI Response
  |
  v
Zod Validation
  |
  v
Study Plan UI