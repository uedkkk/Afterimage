import { getAllCategoriesAdmin } from "@/lib/db/queries";
import { CategoryManager } from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分类管理</h1>
        <p className="text-dim mt-1 text-sm">管理照片分类</p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
