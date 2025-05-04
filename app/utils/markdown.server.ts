import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true,
});

// Sanitize and render markdown to HTML
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml);
}
