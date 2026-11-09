import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "../src/app/page";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      username: "student",
      role: "student",
      stats: { xp: 120, solved: 2, level: 1, streak: 3 },
    },
    loading: false,
  }),
}));

describe("Workspace discovery", () => {
  it("finds tools across categories and recovers from an empty search", () => {
    render(<Home />);
    fireEvent.change(screen.getByRole("textbox", { name: "Find a tool" }), {
      target: { value: "interview" },
    });
    expect(
      screen.getByRole("link", { name: /Interview practice/ }),
    ).toHaveAttribute("href", "/interviews");
    expect(
      screen.queryByRole("link", { name: /Code snippets/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Compete" }));
    expect(screen.getByRole("status")).toHaveTextContent("No tools match");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(
      screen.getByRole("link", { name: /Code snippets/ }),
    ).toBeInTheDocument();
  });
});
