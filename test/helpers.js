// Shared fixtures for the AP tests.
export const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const PAYLOADS = ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', "' onmouseover='x"];

export const TEMPLATE_IDS = ['fantasy', 'scifi', 'anime', 'pixel', 'cyberpunk', 'grimoire', 'tcg', 'wanted', 'dossier', 'magazine', 'storybook', 'streamer', 'clean', 'vertical'];

/** True when some element's class attribute contains exactly this class token. */
export function hasClass(html, name) {
  const escaped = name.replace(/[-]/g, '\\-');
  return new RegExp(`class="(?:[^"]*\\s)?${escaped}(?:\\s[^"]*)?"`).test(html);
}

/** Index of the first element carrying the class token, or -1. */
export function classIndex(html, name) {
  const escaped = name.replace(/[-]/g, '\\-');
  const m = new RegExp(`class="(?:[^"]*\\s)?${escaped}(?:\\s[^"]*)?"`).exec(html);
  return m ? m.index : -1;
}

export const TEXT_FIELD_KEYS = ['name', 'title', 'age', 'gender', 'race', 'role', 'affiliation', 'height', 'birthday', 'quote', 'likes', 'dislikes', 'summary', 'backstory'];

/** Every real tag in the markup, with quoted attribute values blanked so text inside them cannot fake an attribute. */
export function tagsOf(html) {
  return (html.match(/<[a-zA-Z][^<>]*>/g) || []).map((t) => t.replace(/"[^"]*"/g, '""'));
}

/** Throws via assert-like errors when the markup contains a script tag, an event-handler attribute, or a non-data image. */
export function unsafeReasons(html) {
  const reasons = [];
  if (/<script/i.test(html)) reasons.push('script tag');
  for (const tag of tagsOf(html)) {
    if (/\son[a-z]+\s*=/i.test(tag)) reasons.push(`event attribute in ${tag.slice(0, 60)}`);
  }
  for (const img of html.match(/<img\b[^<>]*>/gi) || []) {
    if (!/\ssrc="data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+"/.test(img)) reasons.push(`img without data src: ${img.slice(0, 60)}`);
  }
  return reasons;
}
