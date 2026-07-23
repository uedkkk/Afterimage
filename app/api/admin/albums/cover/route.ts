import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { setAlbumCover } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { albumId?: string; photoId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { albumId, photoId } = body;
  if (!albumId) {
    return NextResponse.json({ error: "缺少相册 ID" }, { status: 400 });
  }

  await setAlbumCover(albumId, photoId ?? null);
  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath("/album/[slug]");
  return NextResponse.json({ success: true });
}
