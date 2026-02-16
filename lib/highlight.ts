import { codeToHtml } from "shiki";

/** Highlights Go source code using Shiki (server-side). */
export async function highlightGo(code: string): Promise<string> {
  return codeToHtml(code, {
    lang: "go",
    theme: "catppuccin-mocha",
  });
}

/** Highlights a short Go snippet as inline code (no <pre> wrapper). */
export async function highlightGoInline(code: string): Promise<string> {
  const html = await codeToHtml(code, {
    lang: "go",
    theme: "catppuccin-mocha",
    structure: "inline",
  });
  return html;
}

/**
 * Processes a plain-text description, replacing `backtick` segments
 * with syntax-highlighted inline Go code. Returns safe HTML.
 */
export async function renderDescription(text: string): Promise<string> {
  const parts = text.split(/`([^`]+)`/);
  const result: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Plain text — escape HTML entities
      result.push(escapeHtml(parts[i]));
    } else {
      // Inline code — highlight with Shiki
      const highlighted = await highlightGoInline(parts[i]);
      result.push(
        `<code class="inline-code">${highlighted}</code>`,
      );
    }
  }

  return result.join("");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
