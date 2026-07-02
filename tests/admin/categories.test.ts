import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createCategory,
  getAllCategoriesAdmin,
  updateCategory,
  deleteCategory,
} from "@/lib/db/queries";

afterAll(async () => {
  await db.$disconnect();
});

describe("category admin queries", () => {
  it("creates, updates, and deletes a category", async () => {
    const created = await createCategory(
      "TestCategory",
      "test-category"
    );
    expect(created.name).toBe("TestCategory");
    expect(created.slug).toBe("test-category");

    const updated = await updateCategory(created.id, {
      name: "UpdatedCategory",
      slug: "updated-category",
      sortOrder: 5,
    });
    expect(updated?.name).toBe("UpdatedCategory");
    expect(updated?.slug).toBe("updated-category");
    expect(updated?.sortOrder).toBe(5);

    await deleteCategory(created.id);
    const deleted = await db.category.findUnique({
      where: { id: created.id },
    });
    expect(deleted).toBeNull();
  });

  it("getAllCategoriesAdmin returns _count.albums", async () => {
    const cat = await createCategory("CountTestCat", "count-test-cat");
    const album = await db.album.create({
      data: {
        title: "CountTestAlbum",
        slug: "count-test-album",
        categoryId: cat.id,
      },
    });

    const categories = await getAllCategoriesAdmin();
    const found = categories.find((c) => c.id === cat.id);
    expect(found).toBeDefined();
    expect(found?._count.albums).toBe(1);

    await db.album.delete({ where: { id: album.id } });
    await deleteCategory(cat.id);
  });
});
