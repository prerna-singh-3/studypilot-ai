import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { studyPlanInputSchema } from "@/lib/validation";
import { studyPlanSchema } from "@/lib/study-plan";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const models = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const responseSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: {
            type: "string",
          },
          focus: {
            type: "string",
          },
          tasks: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: ["summary", "days"],
};

function isRetryableError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit")
  );
}

function getErrorStatus(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit")
  ) {
    return 429;
  }

  if (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand")
  ) {
    return 503;
  }

  return 500;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithFallback(prompt: string) {
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(
          `Trying Gemini model: ${model} (attempt ${attempt + 1})`
        );

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (!response.text) {
          throw new Error("Gemini returned an empty response.");
        }

        return response.text;
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini ${model} attempt ${attempt + 1} failed:`,
          error
        );

        if (!isRetryableError(error)) {
          throw error;
        }

        if (attempt === 0) {
          await wait(1500);
        }
      }
    }

    console.log(`Moving to fallback model after ${model} failed.`);
  }

  throw lastError ?? new Error("All Gemini models failed.");
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "Gemini API key is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const input = studyPlanInputSchema.safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        {
          error: "Please provide valid study information.",
        },
        { status: 400 }
      );
    }

    const { subjects, examDate, dailyHours, weakTopics } = input.data;

    const totalDailyMinutes = dailyHours * 60;

    const prompt = `
You are StudyPilot, an AI study-planning assistant.

Create a personalized and realistic study plan using ONLY the information provided below.

STUDENT INFORMATION
-------------------
Subjects: ${subjects.join(", ")}
Exam date: ${examDate}
Available study time: EXACTLY ${dailyHours} HOURS PER DAY
Weak topics: ${weakTopics.join(", ")}

IMPORTANT RULES
---------------

1. The student has EXACTLY ${dailyHours} hours available for studying every day.

2. NEVER say that the student has 1 hour, 2 hours, 3 hours, or any
other number of hours. The correct available study time is exactly
${dailyHours} hours per day.

3. Each day's total study workload MUST NOT exceed
${totalDailyMinutes} minutes.

4. The study plan MUST prioritize these weak topics:
${weakTopics.join(", ")}

5. The plan should also cover the other subjects:
${subjects.join(", ")}

6. Do not invent subjects or topics that the student did not provide.

7. Include a sensible mixture of:
   - Learning
   - Practice
   - Revision

8. Every task must be specific and actionable.

9. Use the exam date to determine a sensible number of study days.

10. If the exam is very close, prioritize weak topics and important
revision instead of attempting to cover everything.

11. The summary MUST explicitly state that the student has exactly
${dailyHours} hours available per day.

12. Every task MUST include its approximate duration in minutes.

13. The total duration of all tasks for a day should be approximately
${totalDailyMinutes} minutes or less.

14. Do not create unrealistic workloads.

15. Do not provide motivational filler.

16. Return ONLY valid JSON.

17. Do not use Markdown.

18. Do not use code fences.

TASK EXAMPLE
------------
For ${dailyHours} hours per day, a realistic day could contain tasks such as:

"Review binary tree traversal algorithms (60 min)"
"Practice 5 traversal problems (90 min)"
"Study BST operations (60 min)"
"Revise complexity analysis (30 min)"

The exact tasks should depend on the student's subjects and weak topics.

OUTPUT FORMAT
-------------
Return exactly this JSON structure:

{
  "summary": "A short strategy summary that explicitly states the student has ${dailyHours} hours available per day.",
  "days": [
    {
      "day": "Day 1",
      "focus": "Main subject or weak topic",
      "tasks": [
        "Specific study task with duration",
        "Specific practice task with duration",
        "Specific revision task with duration"
      ]
    }
  ]
}
`;

    const text = await generateWithFallback(prompt);

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(text);
    } catch {
      console.error("Invalid JSON returned by Gemini:", text);

      return NextResponse.json(
        {
          error: "The AI returned an invalid study plan. Please try again.",
        },
        { status: 502 }
      );
    }

    const validatedPlan = studyPlanSchema.safeParse(parsedResponse);

    if (!validatedPlan.success) {
      console.error(
        "AI response failed schema validation:",
        validatedPlan.error
      );

      return NextResponse.json(
        {
          error:
            "The AI response did not match the expected study plan format.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      plan: validatedPlan.data,
    });
  } catch (error) {
    console.error("Study plan generation error:", error);

    const status = getErrorStatus(error);

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily busy. StudyPilot tried multiple AI models. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "The Gemini API rate limit was reached. Please wait a little and try again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to generate your study plan right now. Please try again.",
      },
      { status: 500 }
    );
  }
}