import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'figure', 'figcaption',
  'div', 'span',
  'strong', 'em', 'u', 's', 'sub', 'sup',
  'a', 'img',
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  '*': ['class'],
};

const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

const ALLOWED_CLASSES: Record<string, string[]> = {};

export const sanitizeRichText = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowedClasses: ALLOWED_CLASSES,
    // Strip all event handlers (onclick, onerror, onload, etc.)
    exclusiveFilter: (frame: any) => {
      const tag = frame.tag.toLowerCase();
      // Remove iframes, objects, embeds, forms, scripts, styles
      if (['iframe', 'object', 'embed', 'form', 'input', 'script', 'style', 'link', 'meta', 'base'].includes(tag)) {
        return true;
      }
      return false;
    },
    enforceHtmlBoundary: true,
  });
};

export const sanitizeTextOnly = (text: string): string => {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
};
