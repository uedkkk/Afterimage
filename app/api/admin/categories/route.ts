import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db/queries";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "分类名称不能为空" },
      { status: 400 }
    );
  }

  const category = await createCategory(name, slugify(name));
  revalidatePath("/");
  revalidatePath("/category/[slug]");
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; name?: string; slug?: string; sortOrder?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { id, name, slug, sortOrder } = body;
  if (!id) {
    return NextResponse.json({ error: "缺少分类 ID" }, { status: 400 });
  }

  const data: { name?: string; slug?: string; sortOrder?: number } = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  const category = await updateCategory(id, data);
  revalidatePath("/");
  revalidatePath("/category/[slug]");
  return NextResponse.json(category);
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
    return NextResponse.json({ error: "缺少分类 ID" }, { status: 400 });
  }

  await deleteCategory(id);
  revalidatePath("/");
  revalidatePath("/category/[slug]");
  return NextResponse.json({ success: true });
}
