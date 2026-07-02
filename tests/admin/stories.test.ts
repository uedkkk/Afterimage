import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createStory,
  getAllStoriesAdmin,
  getStoryByIdAdmin,
  updateStory,
  deleteStory,
} from "@/lib/db/queries";

afterAll(async () => {
  await db.$disconnect();
});

describe("story admin queries", () => {
  it("creates, gets, updates, and deletes a story", async () => {
    const created = await createStory({
      title: "AdminTestStory",
      slug: "admin-test-story",
      excerpt: "Test excerpt",
      content: "# Hello\n\nThis is a test story.",
    });
    expect(created.title).toBe("AdminTestStory");
    expect(created.slug).toBe("admin-test-story");
    expect(created.published).toBe(false);

    const all = await getAllStoriesAdmin();
    const found = all.find((s) => s.id === created.id);
    expect(found).toBeDefined();
    expect(found?.cover).toBeNull();
    expect(found?.album).toBeNull();

    const byId = await getStoryByIdAdmin(created.id);
    expect(byId).not.toBeNull();
    expect(byId!.title).toBe("AdminTestStory");
    expect(byId!.content).toBe("# Hello\n\nThis is a test story.");

    const updated = await updateStory(created.id, {
      title: "UpdatedStory",
      published: true,
      excerpt: "Updated excerpt",
    });
    expect(updated?.title).toBe("UpdatedStory");
    expect(updated?.published).toBe(true);
    expect(updated?.excerpt).toBe("Updated excerpt");

    await deleteStory(created.id);
    const deleted = await db.story.findUnique({
      where: { id: created.id },
    });
    expect(deleted).toBeNull();
  });
});
