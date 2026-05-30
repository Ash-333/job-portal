"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeTextOnly = exports.sanitizeRichText = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
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
const ALLOWED_ATTRIBUTES = {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class'],
};
const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];
const ALLOWED_CLASSES = {};
const sanitizeRichText = (html) => {
    return (0, sanitize_html_1.default)(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
        allowedSchemes: ALLOWED_SCHEMES,
        allowedSchemesByTag: { img: ['http', 'https', 'data'] },
        allowedClasses: ALLOWED_CLASSES,
        exclusiveFilter: (frame) => {
            const tag = frame.tag.toLowerCase();
            if (['iframe', 'object', 'embed', 'form', 'input', 'script', 'style', 'link', 'meta', 'base'].includes(tag)) {
                return true;
            }
            return false;
        },
        allowDataAttributes: false,
        enforceHtmlBoundary: true,
    });
};
exports.sanitizeRichText = sanitizeRichText;
const sanitizeTextOnly = (text) => {
    return (0, sanitize_html_1.default)(text, {
        allowedTags: [],
        allowedAttributes: {},
    });
};
exports.sanitizeTextOnly = sanitizeTextOnly;
//# sourceMappingURL=sanitize.js.map