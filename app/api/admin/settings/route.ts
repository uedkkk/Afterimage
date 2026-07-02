import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getAllSettings, setSetting } from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getAllSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { settings?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!body.settings || typeof body.settings !== "object") {
    return NextResponse.json(
      { error: "缺少 settings 参数" },
      { status: 400 }
    );
  }

  for (const [key, value] of Object.entries(body.settings)) {
    await setSetting(key, value);
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
