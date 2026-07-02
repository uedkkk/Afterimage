import { describe, it, expect, afterAll, vi } from "vitest";
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { deletePhoto } from "@/lib/db/queries";

const FIXTURE_PATH = path.join(process.cwd(), "tests/fixtures/test-image.jpg");

let createdPhotoIds: string[] = [];

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn().mockResolvedValue({ username: "admin" }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

afterAll(async () => {
  for (const id of createdPhotoIds) {
    try {
      await deletePhoto(id);
    } catch {
      // already deleted
    }
  }
  await db.$disconnect();
});

describe("upload API route", () => {
  it("uploads a file and creates a photo record", async () => {
    const fileBuffer = await readFile(FIXTURE_PATH);
    const file = new File([fileBuffer], "test-image.jpg", {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("files", file);

    const { POST } = await import("@/app/api/admin/upload/route");

    const request = new NextRequest("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
    expect(data.errors).toHaveLength(0);

    const photos = await db.photo.findMany({
      where: { filename: "test-image.jpg" },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    expect(photos).toHaveLength(1);

    const photo = photos[0];
    createdPhotoIds.push(photo.id);

    expect(photo.filename).toBe("test-image.jpg");
    expect(photo.width).toBe(800);
    expect(photo.height).toBe(600);
    expect(photo.mimeType).toBe("image/jpeg");
    expect(photo.filePath).toContain("/uploads/optimized/");
    expect(photo.thumbPath).toContain("/uploads/thumbnails/");
  });

  it("returns 401 without auth", async () => {
    const { getSession } = await import("@/lib/auth/session");
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/admin/upload/route");

    const formData = new FormData();
    const request = new NextRequest("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
