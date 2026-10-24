// Image address validation: the single rule every place that accepts a remote picture goes through. Pure; never throws.

/** Longest accepted address in characters; checked on the trimmed input and again on the normalised form. */
export const MAX_URL_LENGTH = 2048;

const UNSAFE_CHARS = /[\s\u0000-\u001f\u007f]/;
const fail = (error) => ({ ok: false, error });

/**
 * Validate an image address typed or pasted by the user. Only `https:` addresses are accepted: no credentials, no
 * whitespace or control characters, 1 to 2048 characters after trimming.
 * @param {unknown} input
 * @returns {{ok: true, value: string} | {ok: false, error: string}} `value` is the normalised `URL#href`. The normalised
 *   form obeys the length limit too, so validating `value` again returns the same value (stored addresses stay valid).
 */
export function validateImageUrl(input) {
  if (typeof input !== 'string') return fail('이미지 주소를 입력해 주세요.');
  const text = input.trim();
  if (text === '') return fail('이미지 주소를 입력해 주세요.');
  if (text.length > MAX_URL_LENGTH) return fail(`이미지 주소는 ${MAX_URL_LENGTH}자 이하여야 합니다.`);
  if (UNSAFE_CHARS.test(text)) return fail('이미지 주소에 공백이나 제어 문자를 넣을 수 없습니다.');
  let url;
  try {
    url = new URL(text);
  } catch {
    return fail('올바른 주소가 아닙니다. https:// 로 시작하는 전체 주소를 입력해 주세요.');
  }
  if (url.protocol !== 'https:') return fail('https:// 로 시작하는 주소만 사용할 수 있습니다.');
  if (url.username !== '' || url.password !== '') return fail('아이디나 비밀번호가 들어 있는 주소는 사용할 수 없습니다.');
  if (url.hostname === '') return fail('주소에 사이트 이름이 없습니다.');
  if (url.href.length > MAX_URL_LENGTH) return fail(`이미지 주소는 ${MAX_URL_LENGTH}자 이하여야 합니다.`);
  return { ok: true, value: url.href };
}
