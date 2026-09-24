import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Remove qualquer tag HTML de um campo de texto.
 * Usado em DTOs para blindar contra XSS no backend.
 */
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;

    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
    }).trim();
  });
}