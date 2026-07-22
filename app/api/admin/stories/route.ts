import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createStory,
  updateStory,
  deleteStory,
  getStoryByIdAdmin,
} from "@/lib/db/queries";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
  }

  const story = await getStoryByIdAdmin(id);
  if (!story) {
    return NextResponse.json({ error: "故事不存在" }, { status: 404 });
  }

  return NextResponse.json(story);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverId?: string | null;
    albumId?: string | null;
    photoIds?: string[];
    published?: boolean;
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
  const excerpt = body.excerpt?.trim();
  const content = body.content?.trim() ?? "";

  if (!title || !excerpt) {
    return NextResponse.json(
      { error: "标题和摘要不能为空" },
      { status: 400 }
    );
  }

  const photoIds = body.photoIds ?? [];
  const albumId = body.albumId || null;

  if (photoIds.length > 0 && albumId) {
    return NextResponse.json(
      { error: "不能同时关联照片和相册" },
      { status: 400 }
    );
  }

  const slug = body.slug?.trim() || slugify(title);
  try {
    const story = await createStory({
      title,
      slug,
      excerpt,
      content,
      coverId: body.coverId,
      albumId,
      photoIds,
      published: body.published,
    });
    revalidatePath("/stories");
    revalidatePath("/stories/[slug]");
    return NextResponse.json(story, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "创建失败，slug 可能已存在" },
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
    excerpt?: string;
    content?: string;
    coverId?: string | null;
    albumId?: string | null;
    photoIds?: string[];
    published?: boolean;
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
    return NextResponse.json({ error: "缺少故事 ID" }, { status: 400 });
  }

  if (data.slug !== undefined) {
    data.slug = data.slug?.trim() || slugify(data.title ?? "");
  }

  if (data.photoIds !== undefined) {
    const photoIds = data.photoIds;
    const albumId = data.albumId || null;
    if (photoIds.length > 0 && albumId) {
      return NextResponse.json(
        { error: "不能同时关联照片和相册" },
        { status: 400 }
      );
    }
  }

  const story = await updateStory(id, data);
  revalidatePath("/stories");
  revalidatePath("/stories/[slug]");
  return NextResponse.json(story);
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
    return NextResponse.json({ error: "缺少故事 ID" }, { status: 400 });
  }

  await deleteStory(id);
  revalidatePath("/stories");
  revalidatePath("/stories/[slug]");
  return NextResponse.json({ success: true });
}
