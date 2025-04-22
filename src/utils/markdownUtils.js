import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked to silence warnings
marked.setOptions({
  mangle: false,
  headerIds: false
});

/**
 * Safely render markdown to HTML
 * @param {string} text - Markdown text to render
 * @returns {string} Sanitized HTML
 */
export function renderMarkdown(text) {
  if (!text) return '';
  return DOMPurify.sanitize(marked.parse(text));
}

export default {
  renderMarkdown
}; 