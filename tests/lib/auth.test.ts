import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("JWT", () => {
  it("signs and verifies a token", async () => {
    const token = await signToken({ username: "admin" });
    expect(token).toBeDefined();

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.username).toBe("admin");
  });

  it("returns null for invalid token", async () => {
    const payload = await verifyToken("invalid-token");
    expect(payload).toBeNull();
  });
});

describe("password", () => {
  it("hashes a password", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash).not.toBe("mypassword");
    expect(hash.startsWith("$2b$")).toBe(true);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("mypassword");
    const valid = await verifyPassword("mypassword", hash);
    expect(valid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("mypassword");
    const valid = await verifyPassword("wrongpassword", hash);
    expect(valid).toBe(false);
  });
});
