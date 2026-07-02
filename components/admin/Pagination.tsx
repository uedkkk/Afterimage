import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function getPageItems(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "...")[] = [1];

  if (currentPage > 3) {
    items.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (currentPage < totalPages - 2) {
    items.push("...");
  }

  items.push(totalPages);

  return items;
}

function pageHref(basePath: string, page: number): string {
  if (page === 1) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}page=${page}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages);

  return (
    <nav className="flex items-center gap-2">
      {currentPage > 1 && (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className="border border-faint text-dim hover:bg-paper px-3 py-1.5 rounded-md text-sm no-underline"
        >
          上一页
        </Link>
      )}
      {items.map((item, i) =>
        item === "..." ? (
          <span key={`ellipsis-${i}`} className="text-dim px-1">
            …
          </span>
        ) : item === currentPage ? (
          <span
            key={item}
            className="bg-ink text-bg px-3 py-1.5 rounded-md text-sm"
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(basePath, item)}
            className="border border-faint text-dim hover:bg-paper px-3 py-1.5 rounded-md text-sm no-underline"
          >
            {item}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className="border border-faint text-dim hover:bg-paper px-3 py-1.5 rounded-md text-sm no-underline"
        >
          下一页
        </Link>
      )}
    </nav>
  );
}
