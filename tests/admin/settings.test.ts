import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import { setSetting, getAllSettings } from "@/lib/db/queries";

afterAll(async () => {
  await db.setting.deleteMany({ where: { id: { startsWith: "test." } } });
  await db.$disconnect();
});

describe("settings queries", () => {
  it("setSetting and getAllSettings round-trip", async () => {
    await setSetting("test.key", "test.value");

    const settings = await getAllSettings();
    expect(settings["test.key"]).toBe("test.value");
  });

  it("setSetting upserts existing keys", async () => {
    await setSetting("test.upsert", "first");
    await setSetting("test.upsert", "second");

    const settings = await getAllSettings();
    expect(settings["test.upsert"]).toBe("second");
  });
});
