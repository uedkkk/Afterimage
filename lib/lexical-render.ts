import { LexicalHTMLRenderer } from "@tryghost/kg-lexical-html-renderer";
import { DEFAULT_NODES } from "@tryghost/kg-default-nodes";

let rendererInstance: LexicalHTMLRenderer | null = null;

function getRenderer(): LexicalHTMLRenderer {
  if (!rendererInstance) {
    rendererInstance = new LexicalHTMLRenderer({
      nodes: DEFAULT_NODES as never[],
      onError: (error) => {
        console.error("[LexicalHTMLRenderer]", error);
      },
    });
  }
  return rendererInstance;
}

export async function renderLexicalToHtml(lexicalState: string): Promise<string> {
  const renderer = getRenderer();
  const html = await renderer.render(lexicalState, {
    target: "html",
  });
  return html;
}
