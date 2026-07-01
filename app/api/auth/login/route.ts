import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "用户名和密码不能为空" },
      { status: 400 }
    );
  }

  const valid = await authenticateUser(username, password);
  if (!valid) {
    return NextResponse.json(
      { error: "用户名或密码错误" },
      { status: 401 }
    );
  }

  await createSession(username);
  return NextResponse.json({ success: true });
}
