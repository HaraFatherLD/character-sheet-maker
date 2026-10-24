# Acceptance Predicates — Character Sheet Maker MVP v1 (rev.2)
> 생성일: 2026-10-24 | 원본: SPEC.md v1 rev.2 (spec-reviewer BLOCK 반영) | 유형: Type A

**자동 AP 공통 통과 조건**: 지정 파일 존재, `node --test --test-reporter=tap <file>` exit 0, `# pass N`(N ≥ 최소 수)·`# fail 0`·`# skipped 0`·`# todo 0`. 실행 위치 `output/character-sheet-maker/`.

**보안 판정 함수** (`test/helpers.js#unsafeReasons`): 출력의 실제 태그(`<[a-zA-Z][^<>]*>`)마다 따옴표 속성값을 비운 뒤 `on*=` 속성이 있으면 실패; `<script` 존재 시 실패; 모든 `<img>`의 src가 `data:image/(png|jpeg|webp);base64,`가 아니면 실패. 이스케이프된 텍스트(`&lt;img …onerror=…`)는 태그가 아니므로 통과.

## 자동 검증 (Auto)
- [x] `AP-001` (≥2): sampleCharacter — normalize와 deepEqual, 핵심 텍스트 비어있지 않음, tags ≥3, skills ≥2, stats 6, 새 객체(깊은 복사) (AC-1) — `test/ap-001.test.js`
- [x] `AP-002` (≥10): normalizeCharacter — 비객체 5종 ok:false; 텍스트 비문자열 ok:false, null/누락 → ''; 코드포인트 잘림; template/accentColor/statMode; tags; stats(길이 0·3·9, 비객체 원소, 반올림·clamp, NaN·숫자 문자열 → 기본, 라벨 규칙); skills; art; `__proto__`/중첩 `__proto__` 오염 없음; 입력 불변 (AC-2) — `test/ap-002.test.js`
- [x] `AP-003` (≥3): validateImageFile — 형식, 20971520 허용·20971521 거부·0 거부 (AC-3) — `test/ap-003.test.js`
- [x] `AP-004` (≥4): stats — trpgModifier 리터럴(1→-5, 9→-1, 10→0, 11→0, 12→1, 16→3, 30→10), formatModifier, statDisplay 리터럴, 모드 전환 값 보존 (AC-4, AC-17) — `test/ap-004.test.js`
- [x] `AP-005` (≥4): computeOutputSize — A4(1000×1414) 1x/2x/3x = 1000×1414 / 2000×2828 / 3000×4242; WIDE(1600×900) 3x 4800×2700; CARD(750×1050) 2x 1500×2100; custom(A4) 1500→1500×2121, 9999→4243×6000, 100→300×424, ' 1200.4 '→1200×1697; custom(WIDE) 9999→6000×3375; ''/null/undefined/'abc'/Infinity/NaN/'  ' → 1x; scale 2 / 0.5; 미지 preset → 1x (AC-5) — `test/ap-005.test.js`
- [x] `AP-006` (≥9): vnode — toHtml 이스케이프 리터럴; 배열·null·false·0 자식; 금지 태그 7종 throw; 금지 속성 6종 throw; src 규칙; style 직렬화 리터럴, 금지 값(url(, image-set(, expression, /*, @, ;, {, ", ', \, <, 대문자 URL() throw; style 키 규칙(`--accent` 허용, `Color`/`b@d`/`a;b` throw); svg 직렬화; void 태그; **toXhtml**: `<img .../>` 자기 닫힘, 루트 xmlns XHTML, svg xmlns SVG, 동일 검증 throw (AC-6) — `test/ap-006.test.js`
- [x] `AP-007` (≥3): 레지스트리 — 12종 id 순서, 라벨 고유, size 표 값, defaultAccent hex, css 범위·금지 패턴, getTemplate 폴백(`__proto__` 포함), 루트 class·크기·`--accent` (AC-7) — `test/ap-007.test.js`
- [x] `AP-008` (≥4): 템플릿 보안·내용 — 12 템플릿 × (텍스트 14 + tags[0] + stats[0].label + skills[0].name/desc) × 페이로드 3 × 이미지 {없음, art+icon PNG} 에서 unsafeReasons = []; 두 statMode에서 필수 6필드 escape값·`cs-f-<key>` 마커, 6 stat 라벨·statDisplay text, art PNG 포함; 빈 선택 필드 5종 마커 미출력 & 채운 경우 마커 안 값 포함; 이미지 없으면 `cs-f-art` + 내장 svg (AC-8) — `test/ap-008.test.js`
- [x] `AP-009` (≥5): exportHtml — 구조·`.cs-<id>`·`@media print`; 12 템플릿 ok·unsafeReasons 0·모든 src data:image·**고정 샘플 기준** 금지 패턴 부재; `<title>` 이스케이프; quote에 `https://example.com` 넣어도 ok:true·unsafeReasons 0·CSS 금지 패턴 0; 잘못된 이미지/데이터 ok:false·no throw (AC-9) — `test/ap-009.test.js`
- [x] `AP-010` (≥4): safeFilename (AC-10) — `test/ap-010.test.js`
- [x] `AP-011` (≥3): 검사 스크립트 자체 검증 — 임시 디렉터리 픽스처에서 `check-no-html-sink.mjs`가 innerHTML/outerHTML/insertAdjacentHTML/document.write 각 1줄 파일에 exit 1, 깨끗한 파일에 exit 0; `check-size.mjs`가 301줄 파일(src 하위 폴더)에 exit 1, 300줄에 exit 0; 그리고 실제 저장소에서 두 스크립트 exit 0 (AC-11, AP-NFR-SIZE) — `test/ap-011.test.js`
- [x] `AP-012`: 전체 스위트 — `npm test` → `# fail 0`

## 반자동 검증 (Semi) — 로컬 서버 + chrome-devtools
- [x] `AP-013`: 12 디자인 × {샘플, 최대 길이 데이터} 렌더 → 시트 루트 크기 = size; **필수 마커 요소(`cs-f-name/title/race/role/quote/summary/stats/art`)** 의 boundingRect가 루트 내부이고 width·height > 0; 콘솔 error 0; 12종 스크린샷 시트 (AC-13)
- [x] `AP-014`: 빈 localStorage → 샘플; 입력 → 미리보기 텍스트 즉시 반영; reload 유지; `{broken` → 샘플 (AC-1, AC-12)
- [x] `AP-015`: 일러스트 업로드 → img src data URL; fit 전환 → computed object-fit; 초점 슬라이더 → computed object-position; gif 거부·기존 유지; 아이콘 업로드·제거 (AC-3, AC-14)
- [x] `AP-016`: PNG 2x(fantasy), JPEG custom 1500(anime), PNG 3x(streamer) 다운로드 Blob 디코드 → computeOutputSize와 일치, MIME, 파일명 `캐릭터시트_<이름>.<ext>`; 결과 이미지에서 **이름 텍스트 영역(cs-f-name rect × scale) 픽셀이 같은 이미지의 시트 배경 샘플과 다른 픽셀을 ≥1% 포함**; `HTMLCanvasElement.prototype.toBlob`을 null 반환으로 바꾼 상태에서 다운로드 → 실패 안내 메시지 표시 (AC-15)
- [x] `AP-017`: HTML 다운로드 → 새 탭에서 열어 시트 표시, img 디코드, 스크립트 0, 콘솔 error 0 (AC-16)
- [x] `AP-018`: statMode trpg → 미리보기 `(+N)`/`(-N)` 표시, percent 복귀 시 원래 값 (AC-17)
- [x] `AP-019`: 1280/900 → 2단, 899 → 1단, `scrollWidth <= innerWidth` (AC-18)
- [ ] `AP-020`: 배포 URL·`src/app/app.js` HTTP 200 (AC-19, 🔒 배포 승인 후)

## 수동 검증 (Manual)
- [x] `AP-021`: 12 디자인 스크린샷 체크리스트 — 서로 뚜렷이 다른 스타일, 텍스트 판독 가능, 특정 게임·작품 로고/상표/캐릭터 없음, 샘플 캐릭터·일러스트 원작 — code-reviewer + 스크린샷

## 비기능 (NFR)
- [x] `AP-NFR-VALIDATION`: localStorage·이미지 파일 경계가 normalizeCharacter/validateImageFile 경유, 모든 마크업이 toHtml/toXhtml/toDom 경유 — code-reviewer
- [x] `AP-NFR-SIZE`: 모든 소스 ≤300줄 — `node scripts/check-size.mjs` exit 0 (자체 검증은 AP-011)

## 메타데이터
- 총 23 | 자동 12 | 반자동 8 | 수동 1 | NFR 2

---

# v2 Acceptance Predicates (SPEC v2 + rev.2 + rev.3 섹션 — rev 절이 우선)
> 공통 통과 조건·보안 판정 함수는 v1과 동일. 기존 AP-001~012는 **14종 템플릿 기준으로 계속 통과**해야 한다(회귀 AP). AP-007의 템플릿 수·크기 단언은 14종으로 갱신.

## 자동 검증 (Auto)
- [x] `AP-022` (≥8): v2 정규화 — labels(키 화이트리스트, name 키 거부, trim·20자, 빈 값 제거), hidden(화이트리스트, name·art 제거, 중복 제거), customFields(8개, 빈 항목 제거, 잘림, id 재발급·중복), customBlocks(12개, kind 폴백, items 10개·60자, text kind items=[], 빈 블록 유지(렌더 시에만 생략, rev.4), id 재발급), layout(미지·중복 제거, 누락 내장 섹션은 기본 영역 끝, 누락 customBlock은 main 끝, 삭제된 블록 id 제거), palettes(템플릿·토큰 화이트리스트, hex 정규화), v1 데이터 마이그레이션 = 기본값, `__proto__` 오염 없음, genId 주입 결정성 (AC-20) — `test/ap-022.test.js`
- [x] `AP-023` (≥2): 항목명 — 14 템플릿 × 라벨 키에 고유 문자열 지정 시, 해당 마커(`cs-f-<key>`)가 출력되는 모든 경우 그 라벨 문자열도 출력; `stats`·`skills` 라벨은 14종 모두 출력; 라벨 XSS 페이로드 안전 (AC-21) — `test/ap-023.test.js`
- [x] `AP-024` (≥2): 숨김 — 14 템플릿 × HIDEABLE_KEYS 각각 숨김 시 해당 마커 미출력, 나머지 필수 마커 유지; hidden에 name·art 넣어도 출력 유지 (AC-22) — `test/ap-024.test.js`
- [x] `AP-025` (≥3): 사용자 항목 — 14 템플릿 모두 첫 2개 사용자 항목의 label·value가 `cs-f-custom` 마커 안에 출력; 값이 빈 항목은 미출력; `custom` 숨김 시 0개; label·value XSS 페이로드 안전 (AC-23) — `test/ap-025.test.js`
- [x] `AP-026` (≥5): 새 양식 — clean·vertical에서 info/main 영역 컨테이너(`cs-area-info`, `cs-area-main`) 안의 블록 마커 순서 = layout 순서; 블록을 다른 영역으로 옮기면 출력 영역 변경; 사용자 text 블록 본문 줄바꿈·list 항목 출력 및 XSS 안전; 숨김 블록 건너뜀; 팔레트 토큰이 루트 style `--c-<token>`으로 출력, 무효 색은 기본값; size.h=null·minH 존재·루트 style에 height 없음 (AC-24) — `test/ap-026.test.js`
- [x] `AP-027` (≥2): accentInk — `#ffffff`→`#111111`, `#000000`→`#ffffff`, `#ffff00`→`#111111`, `#1a237e`→`#ffffff`; 14 템플릿 루트 style에 `--accent-ink:#` 포함 (AC-25) — `test/ap-027.test.js`
- [x] `AP-028` (≥4): readImageSize — 최소 PNG/JPEG(SOF0·SOF2)/WebP(VP8·VP8L·VP8X) 헤더 픽스처의 정확한 w·h, 잘린 바이트·랜덤 바이트·빈 배열 → null, `isImageTooLarge({w,h})` 50,000,000 경계 (AC-26) — `test/ap-028.test.js`
- [x] `AP-029`: vnode 문자열 속성값 금지 패턴 — `fill:'url(#x)'`, `transform:'expression(1)'` throw (회귀 강화) — `test/ap-006.test.js`에 추가
- [x] `AP-030`: 원작성 회귀 — 템플릿 소스 전체에 `PERSONA` 문자열 없음, streamer defaultAccent ≠ `#9146ff` — `test/ap-007.test.js`에 추가

## 반자동 (Semi) — chrome-devtools (격리 컨텍스트)
- [x] `AP-031`: 항목 관리 패널 — 라벨 변경·숨김 토글이 미리보기 즉시 반영(3개 템플릿), 이름·이미지 토글 없음 (AC-28)
- [x] `AP-032`: 사용자 항목 추가/수정/삭제가 14종 미리보기에 반영 (AC-23, AC-28)
- [x] `AP-033`: 블록 배치 — clean·vertical에서 ↑↓·영역 이동·숨김·사용자 블록 추가/편집/삭제가 미리보기 DOM 순서에 반영, 12개 상한, reload 후 유지 (AC-24, AC-28)
- [x] `AP-034`: 세부 색상 — 토큰 8종 변경이 미리보기 computed style에 반영, [기본값]·[모두 기본값] 동작, 다른 양식으로 갔다 와도 유지 (AC-28)
- [x] `AP-035`: 자동 높이 — 블록을 추가해 높이가 변한 clean·vertical에서 이미지 저장 결과 크기 = `computeOutputSize(resolveBaseSize(size, sheet.scrollHeight), preset)`; 마지막 블록의 bottom ≤ 시트 scrollHeight; 결과 이미지 하단 5% 영역에 배경색과 다른 픽셀 존재(마지막 블록이 하단 근처일 때) (AC-27)
- [x] `AP-036`: 세로형 모바일 — 390px 폭 뷰포트에서 편집기 1단, 미리보기가 폭에 맞게 축소, `scrollWidth <= innerWidth` (AC-29)
- [x] `AP-037`: 14종 스크린샷 시트 + 강조색 `#ffffff`·`#000000`에서 강조 배경 위 글자 판독 가능 (AP-021 재평가)
- [x] `AP-038`: 해상도 제한 — 헤더상 8000×8000 PNG 업로드 시 거부 메시지, 기존 이미지 유지 (AC-26)

## 메타데이터 (v2)
- v2 추가: 자동 9 | 반자동 8 → 전체 누계 40

---
# v3 Acceptance Predicates — 이미지 URL
- [x] `AP-039` (≥3): validateImageUrl (학생증 AP-022와 동일 기준) — `test/ap-039.test.js`
- [x] `AP-040` (≥2): normalizeCharacter artUrl/iconUrl — `test/ap-040.test.js`
- [x] `AP-041` (≥2): vnode src — 검증된 https 허용(이스케이프), 그 외 throw — `test/ap-041.test.js`
- [x] `AP-042` (≥4): exportHtml imageMode — embed CSP `img-src data:`·원격 이미지 거부·미지 모드=embed, link CSP `img-src data: https:`·14종 모두 ok, https는 img src·CSP에만, 위험 값 거부 — `test/ap-042.test.js`
- [x] `AP-043b` (Auto, rev.2): assertRasterImages — `test/ap-043.test.js`
- [x] `AP-043` (Semi): URL 일러스트·아이콘 → 미리보기 반영; "파일에 포함" HTML·이미지 저장은 CORS 허용 URL에서 성공, 거부 URL에서 안내 후 중단; "링크 유지" HTML은 거부 URL에서도 성공하고 열면 이미지 표시; 새로고침 후 URL 유지
- [x] `AP-044` (Semi): 배포 URL 200

---
# v4 Acceptance Predicates — 시트 가로 폭
- [x] `AP-044` (≥2): sheetWidths 정규화 — 미지 템플릿·비수·NaN·범위 밖(399, 2401) 제거, 반올림, `__proto__` 안전, 기존 데이터 `{}` — `test/ap-044.test.js`
- [x] `AP-045` (≥3): effectiveSize 리터럴(fantasy 1200→1200×1697 scale 1.2, tcg 400→400×560, magazine 2400→2400×1500, clean 800→reflow w800 minH1000, 오버라이드 없음→기본) + resolveBaseSize 연동 — `test/ap-045.test.js`
- [x] `AP-046` (≥3): scaleWrap(scale≠1일 때만, 정확한 style), exportHtml에 래퍼·@page 크기, clean 루트 width 800px·래퍼 없음, 기본 폭이면 래퍼 없음 — `test/ap-046.test.js`
- [x] `AP-047` (≥1): clean CSS에 `container-type:inline-size`와 `@container (max-width:760px)` — `test/ap-047.test.js`
- [x] `AP-048` (≥1): presetWidth — 기본/75/125/150% 반올림·clamp — `test/ap-048.test.js`
- [x] `AP-049` (Semi): 14종에서 폭 변경 → 미리보기 시트 실제 크기·HTML 저장 크기·이미지 저장 픽셀이 effectiveSize와 일치; clean 760px 이하 1단; 새로고침 유지; 390px 모바일
- [ ] `AP-050` (Semi): 배포 반영
