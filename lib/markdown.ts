import { marked } from "marked";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

marked.use({
  renderer: {
    image({ href, title, text }) {
      const parts = (text || "").split("|");
      const alt = parts[0]?.trim() ?? "";
      const widthStr = parts[1]?.trim();
      const width = widthStr ? parseInt(widthStr, 10) : NaN;
      const validWidth = width > 0 ? width : null;

      const escapedHref = escapeAttr(href);
      const escapedAlt = escapeAttr(alt);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      const widthAttr = validWidth ? ` width="${validWidth}"` : "";
      const figcaption = alt ? `<figcaption>${escapedAlt}</figcaption>` : "";

      return `<figure><img src="${escapedHref}" alt="${escapedAlt}"${titleAttr}${widthAttr} loading="lazy" />${figcaption}</figure>`;
    },
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const level = Math.min(depth + 1, 6);
      return `<h${level}>${text}</h${level}>\n`;
    },
  },
});

export function renderMarkdown(content: string): string {
  const html = marked.parse(content, { async: false, breaks: true }) as string;
  return html.replace(
    /<p>([\s\S]*?)<figure>([\s\S]*?)<\/figure>([\s\S]*?)<\/p>/g,
    (_match, before, fig, after) => {
      const b = before.replace(/<br\s*\/?>\s*$/, "").trim();
      const a = after.replace(/^\s*<br\s*\/?>/, "").trim();
      let result = "";
      if (b) result += `<p>${b}</p>`;
      result += `<figure>${fig}</figure>`;
      if (a) result += `<p>${a}</p>`;
      return result;
    }
  );
}
