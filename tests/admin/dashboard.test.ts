import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import { getDashboardStats } from "@/lib/db/queries";

afterAll(async () => {
  await db.$disconnect();
});

describe("getDashboardStats", () => {
  it("returns correct shape with recentViews of length 30", async () => {
    const stats = await getDashboardStats();

    expect(stats).toHaveProperty("totalPhotos");
    expect(stats).toHaveProperty("totalAlbums");
    expect(stats).toHaveProperty("totalStories");
    expect(stats).toHaveProperty("totalViews");
    expect(stats).toHaveProperty("publishedAlbums");
    expect(stats).toHaveProperty("recentViews");

    expect(typeof stats.totalPhotos).toBe("number");
    expect(typeof stats.totalAlbums).toBe("number");
    expect(typeof stats.totalStories).toBe("number");
    expect(typeof stats.totalViews).toBe("number");
    expect(typeof stats.publishedAlbums).toBe("number");
    expect(Array.isArray(stats.recentViews)).toBe(true);
    expect(stats.recentViews).toHaveLength(30);

    for (const entry of stats.recentViews) {
      expect(entry).toHaveProperty("date");
      expect(entry).toHaveProperty("count");
      expect(typeof entry.date).toBe("string");
      expect(typeof entry.count).toBe("number");
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
