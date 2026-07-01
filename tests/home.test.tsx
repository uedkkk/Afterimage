import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/(public)/page";

describe("Home page", () => {
  it("renders the site heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("光影的");
    expect(heading).toHaveTextContent("残像");
  });
});
