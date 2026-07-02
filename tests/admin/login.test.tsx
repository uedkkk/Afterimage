import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

import LoginPage from "@/app/admin/login/page";

describe("Login page", () => {
  it("renders the Afterimage title", () => {
    render(<LoginPage />);
    expect(screen.getByText("Afterimage")).toBeInTheDocument();
  });

  it("renders username and password labels", () => {
    render(<LoginPage />);
    expect(screen.getByText("用户名")).toBeInTheDocument();
    expect(screen.getByText("密码")).toBeInTheDocument();
  });

  it("renders the login button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
  });
});
