import { describe, expect, it } from "vitest";
import { studyPlanInputSchema } from "./validation";

describe("studyPlanInputSchema", () => {
  it("accepts valid study plan input", () => {
    const result = studyPlanInputSchema.safeParse({
      subjects: ["Data Structures", "DBMS", "Digital Electronics"],
      examDate: "2026-10-01",
      dailyHours: 4,
      weakTopics: ["Trees", "SQL joins", "Karnaugh maps"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects study time above 16 hours", () => {
    const result = studyPlanInputSchema.safeParse({
      subjects: ["Data Structures"],
      examDate: "2026-10-01",
      dailyHours: 17,
      weakTopics: ["Trees"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty subjects", () => {
    const result = studyPlanInputSchema.safeParse({
      subjects: [],
      examDate: "2026-10-01",
      dailyHours: 4,
      weakTopics: ["Trees"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty weak topics", () => {
    const result = studyPlanInputSchema.safeParse({
      subjects: ["Data Structures"],
      examDate: "2026-10-01",
      dailyHours: 4,
      weakTopics: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero study hours", () => {
    const result = studyPlanInputSchema.safeParse({
      subjects: ["Data Structures"],
      examDate: "2026-10-01",
      dailyHours: 0,
      weakTopics: ["Trees"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing exam date", () => {
    const result = studyPlanInputSchema.safeParse({
      subjects: ["Data Structures"],
      examDate: "",
      dailyHours: 4,
      weakTopics: ["Trees"],
    });

    expect(result.success).toBe(false);
  });
});