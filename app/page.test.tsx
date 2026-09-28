import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Home from "./page";

describe("StudyPilot form", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              plan: {
                summary:
                  "A focused study plan using 4 hours of study time per day.",
                days: [
                  {
                    day: "Day 1",
                    focus: "Data Structures - Trees",
                    tasks: [
                      "Study binary trees (60 min)",
                      "Practice tree problems (90 min)",
                    ],
                  },
                ],
              },
            }),
        })
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the StudyPilot form", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /your study plan, built with ai/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/subjects/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/exam date/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/study hours/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/weak topics/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /generate study plan/i,
      })
    ).toBeInTheDocument();
  });

  it("shows an error when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error:
                "Unable to generate your study plan right now. Please try again.",
            }),
        })
      )
    );

    render(<Home />);

    fireEvent.change(screen.getByLabelText(/subjects/i), {
      target: {
        value: "Data Structures",
      },
    });

    fireEvent.change(screen.getByLabelText(/exam date/i), {
      target: {
        value: "2026-10-01",
      },
    });

    fireEvent.change(screen.getByLabelText(/study hours/i), {
      target: {
        value: "4",
      },
    });

    fireEvent.change(screen.getByLabelText(/weak topics/i), {
      target: {
        value: "Trees",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /generate study plan/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      /unable to generate your study plan/i
    );
  });

  it("generates and displays an AI study plan", async () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText(/subjects/i), {
      target: {
        value: "Data Structures, DBMS",
      },
    });

    fireEvent.change(screen.getByLabelText(/exam date/i), {
      target: {
        value: "2026-10-01",
      },
    });

    fireEvent.change(screen.getByLabelText(/study hours/i), {
      target: {
        value: "4",
      },
    });

    fireEvent.change(screen.getByLabelText(/weak topics/i), {
      target: {
        value: "Trees, SQL joins",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /generate study plan/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /your personalized roadmap/i,
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/4 hours of study time per day/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Data Structures - Trees/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Study binary trees \(60 min\)/i)
    ).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith(
      "/api/generate",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
});