import { cookies } from "next/headers";
import { signToken, verifyToken } from "./jwt";
import { db } from "@/lib/db";
import { verifyPassword } from "./password";

const COOKIE_NAME = "afterimage_session";

export async function createSession(username: string): Promise<void> {
  const token = await signToken({ username });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<{ username: string }> {
  const session = await getSession();
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<boolean> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return false;
  return verifyPassword(password, user.password);
}
