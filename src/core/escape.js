// Text escaping shared by every serializer. Pure functions, no DOM.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// XML 1.0 forbids C0 controls (except tab/LF/CR), U+FFFE/U+FFFF and unpaired surrogates.
const XML_INVALID = /[\x00-\x08\x0B\x0C\x0E-\x1F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/**
 * Escape a value for an HTML text node or a double-quoted attribute value.
 * @param {unknown} value null/undefined become an empty string; anything else goes through String().
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Remove characters that cannot appear in an XML 1.0 document.
 * @param {unknown} value
 * @returns {string}
 */
export function stripXmlInvalid(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(XML_INVALID, '');
}

/**
 * Escape for XML output (raster path): strip illegal characters, then escape like HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeXml(value) {
  return escapeHtml(stripXmlInvalid(value));
}
