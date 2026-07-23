import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAllAlbumsAdmin,
} from "@/lib/db/queries";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const albums = await getAllAlbumsAdmin();
  return NextResponse.json(
    albums.map((a) => ({ id: a.id, title: a.title }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
    published?: boolean;
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

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json(
      { error: "相册标题不能为空" },
      { status: 400 }
    );
  }

  const slug = body.slug?.trim() || slugify(title);
  try {
    const album = await createAlbum({
      title,
      slug,
      description: body.description,
      categoryId: body.categoryId,
      published: body.published,
    });
    revalidatePath("/");
    revalidatePath("/albums");
    revalidatePath("/category/[slug]");
    revalidatePath("/album/[slug]");
    return NextResponse.json(album, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "创建失败，slug 可能已存在" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    categoryId?: string | null;
    published?: boolean;
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

  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "缺少相册 ID" }, { status: 400 });
  }

  if (data.slug !== undefined) {
    data.slug = data.slug?.trim() || slugify(data.title ?? "");
  }

  try {
    const album = await updateAlbum(id, data);
    revalidatePath("/");
    revalidatePath("/albums");
    revalidatePath("/category/[slug]");
    revalidatePath("/album/[slug]");
    return NextResponse.json(album);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "更新失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "缺少相册 ID" }, { status: 400 });
  }

  try {
    await deleteAlbum(id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "删除失败" },
      { status: 409 }
    );
  }
  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath("/category/[slug]");
  revalidatePath("/album/[slug]");
  return NextResponse.json({ success: true });
}
