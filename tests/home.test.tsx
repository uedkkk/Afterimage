import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/(public)/page";

vi.mock("@/lib/db/queries", () => ({
  getAllPhotos: vi.fn().mockResolvedValue([]),
  getPublishedAlbums: vi.fn().mockResolvedValue([]),
  getAllSettings: vi.fn().mockResolvedValue({}),
}));

describe("Home page", () => {
  it("renders the site heading", async () => {
    const jsx = await Home();
    render(jsx);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("光影的");
    expect(heading).toHaveTextContent("残像");
  });
});
