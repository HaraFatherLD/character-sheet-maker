// Browser downloads via a temporary object URL and an <a download> click.

/**
 * Offer a Blob as a file download.
 * @param {Blob} blob
 * @param {string} filename
 * @returns {void}
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Offer text (for example the exported HTML document) as a file download.
 * @param {string} text
 * @param {string} filename
 * @param {string} [mime]
 * @returns {void}
 */
export function downloadText(text, filename, mime = 'text/html;charset=utf-8') {
  downloadBlob(new Blob([text], { type: mime }), filename);
}
