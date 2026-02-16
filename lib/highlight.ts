import { codeToHtml } from "shiki";

/** Highlights Go source code using Shiki (server-side). */
export async function highlightGo(code: string): Promise<string> {
  return codeToHtml(code, {
    lang: "go",
    theme: "catppuccin-mocha",
  });
}
