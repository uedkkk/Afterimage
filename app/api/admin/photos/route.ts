import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  updatePhoto,
  deletePhoto,
  bulkAssignAlbum,
  bulkDeletePhotos,
} from "@/lib/db/queries";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    photoIds?: string[];
    title?: string;
    description?: string;
    albumId?: string | null;
    tags?: string[];
    sortOrder?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (body.photoIds && Array.isArray(body.photoIds)) {
    await bulkAssignAlbum(body.photoIds, body.albumId ?? null);
    revalidatePath("/");
    revalidatePath("/album/[slug]");
    return NextResponse.json({ success: true });
  }

  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "缺少照片 ID" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.albumId !== undefined) updateData.albumId = data.albumId;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  const photo = await updatePhoto(id, updateData as Parameters<typeof updatePhoto>[1]);
  revalidatePath("/");
  revalidatePath("/album/[slug]");
  revalidatePath("/photo/[id]");
  return NextResponse.json(photo);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; photoIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (body.photoIds && Array.isArray(body.photoIds)) {
    await bulkDeletePhotos(body.photoIds);
    revalidatePath("/");
    revalidatePath("/album/[slug]");
    return NextResponse.json({ success: true });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "缺少照片 ID" }, { status: 400 });
  }

  await deletePhoto(id);
  revalidatePath("/");
  revalidatePath("/album/[slug]");
  revalidatePath("/photo/[id]");
  return NextResponse.json({ success: true });
}
