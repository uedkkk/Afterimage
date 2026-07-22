export function isLexicalContent(content: unknown): boolean {
  if (typeof content !== "string") return false;
  if (!content || !content.trimStart().startsWith("{")) return false;
  try {
    const parsed = JSON.parse(content);
    return parsed?.root?.type === "root";
  } catch {
    return false;
  }
}

export const EMPTY_LEXICAL_STATE = JSON.stringify({
  root: {
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "", format: 0, style: "", mode: "normal", detail: 0, version: 1 }],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});
