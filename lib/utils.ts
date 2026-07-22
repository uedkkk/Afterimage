export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function estimateReadingTime(content: string): number {
  let text = content;
  if (content.trimStart().startsWith("{")) {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.root?.type === "root") {
        const texts: string[] = [];
        function extractText(node: Record<string, unknown>) {
          if (typeof node.text === "string") texts.push(node.text);
          if (Array.isArray(node.children)) node.children.forEach((c) => extractText(c as Record<string, unknown>));
        }
        extractText(parsed.root as Record<string, unknown>);
        text = texts.join(" ");
      }
    } catch {}
  }
  text = text.replace(/[#*`\[\]()>_~|-]/g, " ");
  return Math.max(1, Math.ceil(text.length / 400));
}
