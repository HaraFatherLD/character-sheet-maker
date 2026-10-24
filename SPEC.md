# Feature Spec: Character Sheet Maker (MVP v1)

> 버전: v1 | 작성일: 2026-10-24 | 상태: Draft | 사용자 결정: 디자인 12종, 능력치 퍼센트형 + TRPG형 옵션, Chrome 우선, 프로젝트 파일 저장 제외

## 목적
캐릭터 정보와 사용자가 그린 일러스트를 넣으면 12종 디자인 중 하나로 캐릭터 시트를 실시간 미리보기하고,
**단독 HTML** 또는 **원하는 크기의 PNG/JPEG**로 내려받는다. GitHub Pages(`HaraFatherLD/character-sheet-maker`) 배포.

## 사용자 스토리
AS A 자작 캐릭터를 정리·공유하고 싶은 창작자
I WANT 정보와 내 그림을 넣고 마음에 드는 디자인을 골라
SO THAT 완성된 시트를 HTML이나 이미지로 바로 받아 쓸 수 있다

## 핵심 아키텍처 — "VNode 템플릿" (XSS 안전 설계)
- 템플릿은 HTML 문자열이 아니라 **순수 데이터 트리(VNode)** 를 반환한다: `h(tag, attrs, ...children)` → `{tag, attrs, children}`; 문자열 자식은 텍스트 노드.
- `toHtml(vnode)`(순수, Node 테스트): 텍스트·속성값을 모두 `escapeHtml`. 태그·속성 **화이트리스트** 외 사용 시 throw(개발 오류 조기 발견).
  - 허용 태그: `div span p h1 h2 h3 h4 ul ol li img section header footer figure figcaption strong em small br hr svg path circle rect line polygon polyline g text`
  - 허용 속성: `class style src alt viewBox d cx cy r x y x1 y1 x2 y2 width height points fill stroke stroke-width opacity transform text-anchor font-size rx ry aria-hidden role`
  - `src`는 `^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$` 만 허용, 그 외 throw
  - `style`은 객체 `{prop: value}`로만 받는다. 공용 검증기 `validateStyle(obj)`(vnode.js export):
    - 키: `^(--[a-z][a-z0-9-]*|[a-z][a-z-]*)$` 불일치 → throw
    - 값(문자열/유한수, 대소문자 무시): `url(` `image-set(` `expression` `/*` `@` `;` `{` `}` `<` `>` `"` `'` `\` 포함 → throw
    - 직렬화: `prop:value` 를 `;`로 연결(공백 없음)
- `toHtml(vnode)`: HTML 직렬화. void 태그(`img br hr`)는 `<img ...>` 형태, svg 하위 요소는 `<circle ...></circle>`.
- `escapeHtml(s)`: `&`→`&amp;` `<`→`&lt;` `>`→`&gt;` `"`→`&quot;` `'`→`&#39;`; null/undefined → `''`; 그 외 `String(s)`
- `toXhtml(vnode)`: 래스터용 XML 직렬화 — 같은 화이트리스트·검증, **자식이 없는 모든 요소는 자기 닫힘**(`<img .../>`, `<rect .../>`, `<div/>`), 텍스트·속성값에서 XML 금지 제어문자 `[\x00-\x08\x0B\x0C\x0E-\x1F]` 제거 후 이스케이프, 루트에 `xmlns="http://www.w3.org/1999/xhtml"`, `svg`에 `xmlns="http://www.w3.org/2000/svg"`(내부 자동 부여, 화이트리스트 속성 아님)
- `toDom(vnode, document)`(app 전용): `createElement`/`createElementNS`(svg)/`setAttribute`/`textContent`/`style.setProperty`만 사용, `validateStyle`·src 검증 공유. **`innerHTML` 등 HTML 싱크 전면 금지.**

### 필드 마커 규약 (`cs-f-<key>`)
- 템플릿은 각 데이터 항목을 감싸는 요소에 `cs-f-<key>` 클래스를 붙인다: 텍스트 필드 14종의 key 그대로, 그리고 `cs-f-tags`, `cs-f-stats`, `cs-f-skills`, `cs-f-art`, `cs-f-icon`.
- **필수 표시**: name, title, race, role, quote, summary, stats, art → 항상 마커 존재.
- **선택 필드**(age, gender, affiliation, height, birthday, likes, dislikes, backstory, tags, skills): 값이 비면(빈 문자열 / 빈 배열) **마커 요소(라벨 포함) 자체를 출력하지 않음**; 값이 있고 디자인이 표시한다면 마커 요소 안에 값 포함.
- `cs-f-icon`은 디자인이 아이콘 자리를 갖는 경우에만 출력하며, 업로드 아이콘이 없으면 엠블럼을 표시한다(선택 필드 규칙의 예외).
- 능력치 표시값(statDisplay text)은 **독립 텍스트 노드**로 출력한다(`<span>16 (+3)</span>` 형태). 막대·레이더 등 시각 요소는 추가로 가능.
- 템플릿 CSS는 정적 문자열(`.cs-<id>` 범위 지정). `url(`, `@import`, `http:`, `https:`, `expression`, `</style` 금지.

## 파일 레이아웃
```
output/character-sheet-maker/   ← 독립 git 저장소 = Pages 루트 (main, /), 상대 경로만
  index.html style.css package.json scripts/check-size.mjs scripts/check-no-html-sink.mjs
  src/core/escape.js vnode.js schema.js sample.js sample-art.js stats.js size.js filename.js export-html.js view-model.js
  src/templates/index.js (레지스트리) + 12개 템플릿 파일 (fantasy.js … streamer.js)
  src/app/app.js form.js images.js raster.js download.js   ← DOM
  test/ap-0NN.test.js
```

## 데이터 모델 (`CharacterData`, localStorage 키 `character-sheet-maker:v1`, 이미지 제외)
**텍스트 필드** (누락·`undefined`·`null` → `''`; 그 외 문자열 아님 → `ok:false`; 상한 초과 → 코드포인트 단위로 잘라냄; trim 안 함):
| 필드 | 상한 | 필드 | 상한 |
|---|---|---|---|
| name | 40 | title (별칭/칭호) | 60 |
| age / gender / height / birthday | 20 | race / role | 30 |
| affiliation | 40 | quote | 120 |
| likes / dislikes | 120 | summary (소개) | 300 |
| backstory (배경 이야기) | 1500 | | |

**구조 필드** (무효 → 기본값, `ok:false` 아님):
| 필드 | 규칙 | 기본 |
|---|---|---|
| template | 12개 id 중 하나 | `'fantasy'` |
| accentColor | `''`(템플릿 기본) 또는 `#rrggbb`(소문자 정규화) | `''` |
| statMode | `'percent'` \| `'trpg'` | `'percent'` |
| tags | 문자열 배열, 각 trim 후 빈 값 제거·16자 잘림, 최대 8개(초과분 버림), 비배열 → `[]`, 비문자열 원소 제거 | `[]` |
| stats | **정확히 6개** `{label, percent, score}`. label 문자열 12자(비문자열 → 기본 라벨), percent 정수 0–100(반올림·clamp; `typeof number`가 아니거나 비유한수 → 50, 숫자 문자열도 기본값), score 정수 1–30(같은 규칙, 기본 10). 원소가 비객체면 해당 칸 기본 스탯. 배열 아님/길이≠6 → 누락 칸은 기본 스탯으로 채우고 초과분 버림 | 아래 |
| skills | 비객체 원소 제거 → name·desc(비문자열 → '') 모두 빈 항목 제거 → **그 후** 앞에서 6개, 각 `{name(30), desc(120)}` 잘림, 비배열 → `[]` | `[]` |
| art | `{fit: 'cover'|'contain', focusX: 0–100, focusY: 0–100}` (정수 clamp) | `{fit:'cover', focusX:50, focusY:30}` |

기본 스탯 라벨: `['힘','민첩','체력','지능','지혜','매력']`.
`normalizeCharacter(raw)` → `{ok:true, value}` | `{ok:false, error}`; 절대 throw 안 함; 비객체 → `ok:false`; 화이트리스트 키로 새 객체 구성(프로토타입 오염 없음); 입력 불변.

## 능력치 (`stats.js`)
- `trpgModifier(score)` = `Math.floor((score - 10) / 2)` → 표시 `formatModifier(m)`: `+3`, `0`→`+0`, `-1`
- `statDisplay(stat, mode)` → percent: `{value: percent, max: 100, text: '72'}`; trpg: `{value: score, max: 30, text: '16 (+3)'}`

## 이미지 (메모리만, localStorage 미저장)
- `validateImageFile({type,size})`: image/jpeg·png·webp, 1 ≤ size ≤ 20 MiB
- 업로드 시 디코드 → 긴 변 초과 시 축소(art 2400px, icon 512px) → data URL로 보관 (원본 png/webp → PNG, jpeg → JPEG 0.92)
- 이미지 없을 때: art는 `sample-art.js`의 원작 SVG 일러스트(data URL 아님, VNode svg), icon은 엠블럼(이름을 trim한 첫 **코드포인트**, 빈 이름 → `?`)
- 시스템 글꼴 스택(웹폰트 금지): 산세리프 `"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif` / 세리프 `"Batang","AppleMyungjo","Noto Serif KR",serif` / 모노 `Consolas,"D2Coding",monospace`

## 템플릿 규약 (`src/templates/*.js`)
각 모듈 default export `{ id, label, size:{w,h}, defaultAccent, css, render(vm) }`
- `render(vm)` → VNode (루트 `div.cs-sheet.cs-<id>`, style에 `width/height = size px`, `--accent`)
- `vm`은 `view-model.js`의 `buildViewModel(data, images)` 결과: 정규화된 데이터 + 능력치 표시값 + 이미지 src(검증된 data URL 또는 null) + art 스타일(object-fit, object-position `X% Y%`)
- 텍스트 넘침 방지: CSS `overflow:hidden` + 긴 필드에 `-webkit-line-clamp`
| id | 라벨 | size(w×h) |
|---|---|---|
| fantasy | 판타지 양피지 | 1000×1414 |
| scifi | SF 홀로그램 HUD | 1000×1414 |
| anime | 애니 프로필 | 1000×1414 |
| pixel | 픽셀 레트로 | 1000×1414 |
| cyberpunk | 사이버펑크 네온 | 1000×1414 |
| grimoire | 고딕 마도서 | 1414×1000 |
| tcg | 트레이딩 카드 | 750×1050 |
| wanted | 현상수배 포스터 | 1000×1414 |
| dossier | 기밀 문서 | 1000×1414 |
| magazine | 매거진 화보 | 1600×1000 |
| storybook | 수채화 동화책 | 1000×1414 |
| streamer | 방송인 프로필 | 1600×900 |
- 모든 템플릿은 필수 표시 항목(위 마커 규약)과 능력치 6개(라벨 + statMode별 text)를 반드시 표시. 선택 필드는 마커 규약을 따른다.
- 특정 게임·작품의 로고/상표/고유 UI를 복제하지 않음. 장식은 CSS 그라데이션·테두리·인라인 SVG로만.

## 내보내기
- `size.js`: `PRESETS=['1x','2x','3x','custom']`, `MAX_SIDE=6000`, `MIN_WIDTH=300`; `computeOutputSize(base, preset, customWidth)` → `{width, height, scale}`; 1x/2x/3x = base × n (12종 최대 4800이므로 상한 미도달); custom: null/undefined → 1x, 그 외 `Number(String(v).trim())`, 빈값/NaN/Infinity → 1x, 반올림, `[300, floor(6000·w/max(w,h))]` clamp, height = round(width·h/w); scale = width/base.w; 미지 preset → 1x
- `exportHtml(data, images, template)` → `{ok:true, html}` | `{ok:false, error}`, throw 안 함: `<!doctype html>`, charset, viewport, `<title>`(이스케이프된 `<name> - 캐릭터 시트`), `<style>`(공통 + 템플릿 CSS + 화면 맞춤 + `@media print`), body에 `toHtml(render(vm))`.
  - 금지 패턴 불변식의 범위: (a) **템플릿·공통 CSS 문자열**에 `url(`·`@import`·`http:`·`https:`·`expression`·`</style` 없음, (b) 출력의 **모든 태그**(속성값 내용 제외)가 화이트리스트 태그·속성만 사용하고 `on*` 속성 없음, (c) 모든 `src` 값은 data:image. 사용자 텍스트에 URL이 있어도 위 불변식은 유지된다(텍스트는 이스케이프되어 태그가 아님).
- 이미지 저장(`raster.js`, Chrome):
  1. `markup = toXhtml(render(vm))`, `css = 공통 CSS + 템플릿 CSS`
  2. `svg = <svg xmlns="http://www.w3.org/2000/svg" width="{out.w}" height="{out.h}" viewBox="0 0 {base.w} {base.h}"><foreignObject x="0" y="0" width="{base.w}" height="{base.h}"><div xmlns="http://www.w3.org/1999/xhtml"><style><![CDATA[{css}]]></style>{markup}</div></foreignObject></svg>`
  3. `data:image/svg+xml;charset=utf-8,` + `encodeURIComponent(svg)` → `Image` 로드 → 출력 크기 Canvas에 `drawImage(img, 0, 0, out.w, out.h)` (JPEG는 흰색 먼저 채움) → `toBlob`(PNG 또는 JPEG 0.92)
  4. 실패(로드 오류 / SecurityError / null blob / 예외) → 상태 "이미지 저장에 실패했습니다. HTML 다운로드를 이용해 주세요"
- `exportHtml`은 images.art/icon이 null이 아니면서 src 규칙 위반이면 `{ok:false}`(조용히 null 처리하지 않음). data가 비객체면 `{ok:false}`.
- 파일명 `safeFilename(base, ext)`: `\/:*?"<>|`·제어문자(U+0000–U+001F) 제거 → 앞뒤 공백·끝 점 제거 → Windows 예약어(CON, PRN, AUX, NUL, COM1-9, LPT1-9, 대소문자 무시, 정확히 일치)면 `_` 접미 → 100 코드포인트 상한 → 빈 결과면 `character-sheet` → `<base>.<ext>`. 앱은 base = name이 있으면 `캐릭터시트_<name>` 아니면 `캐릭터시트`.
- 검사 스크립트: `process.cwd()`를 저장소 루트로 사용. 줄 수 = `wc -l` 기준(끝 개행 하나는 줄로 세지 않음). HTML 싱크 검사는 `index.html`과 `src/**/*.js`만 대상.

## 수용 기준 (Acceptance Criteria)
- AC-1 첫 접속 시 샘플 캐릭터(원작 이름·설정·SVG 일러스트)
- AC-2 normalizeCharacter 규칙 전부
- AC-3 validateImageFile 경계, 거부 시 기존 이미지 유지 + 에러
- AC-4 stats: trpgModifier/formatModifier/statDisplay, statMode 전환 시 값 보존
- AC-5 computeOutputSize 전 규칙
- AC-6 vnode: toHtml 이스케이프·태그/속성/src/style 화이트리스트 위반 throw
- AC-7 템플릿 레지스트리: 12종 id·라벨 고유, size 범위, css 금지 패턴 없음, 루트 클래스·크기
- AC-8 **모든 템플릿 × 모든 텍스트 필드 × XSS 페이로드** → toHtml 결과에 실행 가능한 태그/속성 없음; 필수 표시 필드가 출력에 포함; 빈 선택 필드는 라벨 숨김
- AC-9 exportHtml 구조·금지 패턴·이스케이프
- AC-10 safeFilename
- AC-11 HTML 싱크 미사용
- AC-12 입력 → 미리보기 즉시 갱신, 자동 저장·복원, 손상 → 샘플
- AC-13 디자인 전환 12종 모두 렌더(콘솔 error 0), 최대 길이 데이터에서도 시트 밖 넘침 없음
- AC-14 일러스트 업로드·맞춤 방식·초점 슬라이더 반영, 아이콘 업로드·제거
- AC-15 이미지 다운로드 픽셀 크기·MIME·파일명 일치 (Chrome)
- AC-16 HTML 다운로드 단독 표시
- AC-17 능력치 모드 전환이 미리보기에 반영 (TRPG: `16 (+3)` 형식)
- AC-18 반응형 ≥900 2단 / ≤899 1단, 가로 스크롤 없음
- AC-19 배포 URL + 모듈 200

## 범위 제외
프로젝트 파일 저장/불러오기, 웹폰트, Safari 이미지 저장 보장, 다중 캐릭터, 사용자 정의 템플릿, 13번째 이후 디자인

## 리스크
- [S] Safari foreignObject 래스터 실패 → 안내 메시지(범위 제외)
- [I] 긴 텍스트 넘침 → 상한 + line-clamp + AP-013 브라우저 검증
- [K] 큰 이미지 → 업로드 시 축소
- [I] 12종 작업량 → 템플릿 파일 독립, 병렬 구현

---

# v2 변경 — 항목 편집 · 사용자 블록 · 새 양식 2종 · 세부 색상

> 작성일: 2026-10-24 | 사용자 결정: 블록 편집·세부 색상은 **새 양식 2종(clean, vertical)** 에만, 기존 12종은 항목명 편집·사용함/사용안함·**사용자 항목** 추가/삭제, 이름·이미지는 끌 수 없음, 완료 후 배포.

## v2 데이터 모델 추가 (`CharacterData` 확장, 모두 정규화 대상 — 무효 → 기본값, `ok:false` 아님)
| 필드 | 규칙 | 기본 |
|---|---|---|
| `labels` | 객체. 키는 `LABEL_KEYS`만(아래), 값은 문자열 trim 후 20 코드포인트 잘림, 빈 값·비문자열 → 키 제거(기본 라벨 사용) | `{}` |
| `hidden` | 문자열 배열, `HIDEABLE_KEYS` 원소만, 중복 제거, 정렬 없이 입력 순서 유지 | `[]` |
| `customFields` | 최대 8개 `{id, label(20), value(60)}`. 비객체 원소 제거, label·value 비문자열 → '', 둘 다 빈 항목 제거, id 무효/중복 → 재발급 | `[]` |
| `customBlocks` | 최대 12개 `{id, kind:'text'|'list', title(30), body(600), items}`. kind 무효 → 'text'. items: 문자열 배열 최대 10개·각 60자, 빈 값 제거(kind 'text'면 `[]`). title·body·items 모두 빈 블록 제거, id 무효/중복 → 재발급 | `[]` | *(rev.4로 대체: 빈 블록은 유지, 렌더만 생략)*
| `layout` | `{info: string[], main: string[]}`. 원소는 `BLOCK_KEYS`(내장 섹션) 또는 존재하는 customBlocks id. 미지 원소·중복(두 영역 통틀어 첫 등장만 유지) 제거. **layout에 없는 내장 섹션은 기본 영역 끝에 추가**, layout에 없는 customBlock은 `main` 끝에 추가 | `DEFAULT_LAYOUT` |
| `palettes` | `{clean: {...}, vertical: {...}}`. 각 객체 키는 해당 템플릿 `PALETTE_TOKENS`만, 값은 `#rrggbb`(소문자 정규화), 무효 → 키 제거(템플릿 기본) | `{}` |

- `id` 형식 `^[a-z0-9-]{1,24}$`. 재발급은 주입 가능한 `genId`(기본 `crypto.randomUUID()` 앞 8자리 기반 `b-xxxxxxxx`), 기존 id와 충돌 시 재시도.
- `LABEL_KEYS` = 텍스트 필드 14종 − {name} + {`tags`,`stats`,`skills`,`profile`,`custom`}
- `HIDEABLE_KEYS` = 텍스트 필드 14종 − {name} + {`tags`,`stats`,`skills`,`icon`,`custom`} (`name`·`art`는 숨길 수 없음 — 입력에 있어도 제거)
- `BLOCK_KEYS`(새 양식의 내장 섹션) = `profile`(나이·성별·종족·직업·소속·키·생일·사용자 항목 묶음), `quote`, `summary`, `likes`, `dislikes`, `tags`, `stats`, `skills`, `backstory`
- `DEFAULT_LAYOUT` = `{info: ['profile','quote'], main: ['summary','stats','skills','tags','likes','dislikes','backstory']}`
- 기본 영역: `profile`,`quote` → info / 나머지 → main
- **마이그레이션**: v1 데이터(위 필드 없음)는 그대로 정규화되어 기본값을 받는다. 별도 버전 키 불필요.

## v2 view-model / parts 규칙 (14종 공통)
- `vm.label(key)` = `labels[key]` 또는 기본 라벨(`DEFAULT_LABELS`: 텍스트 필드는 기존 라벨, tags '태그', stats '능력치', skills '스킬', profile '프로필', custom '추가 정보').
- **템플릿은 화면에 보이는 모든 항목명·섹션 제목을 `vm.label(key)`로 출력**한다(장식용 영문 부제 `STATUS`, `// STATS` 등은 별도 허용, 단 사용자 라벨이 반드시 함께 출력).
- `vm.isHidden(key)` 이면 해당 마커 요소를 출력하지 않는다. 필수 마커 규칙은 "숨기지 않은 경우에 한해" 적용(`name`, `art`는 항상).
- **사용자 항목**: 값이 있는 customFields는 각 템플릿의 프로필/정보 영역에 `fieldRow`와 같은 모양으로 출력, 각 행 마커 `cs-f-custom`. `hidden`에 `custom`이면 전부 미출력. 공간이 좁은 디자인(tcg 등)은 앞에서부터 넣을 수 있는 만큼만 표시(최소 2개).
- `--accent-ink`: view-model이 강조색 상대 휘도로 `#ffffff`/`#111111` 중 대비가 큰 색을 계산, 루트 style에 출력. **강조색 배경 위 글자는 `var(--accent-ink)`** 사용.

## 새 양식 2종 (블록 편집 + 세부 색상)
| id | 라벨 | size | 구조 |
|---|---|---|---|
| clean | 깔끔한 양식 | w 1000, **h 자동**(최소 1000) | 상단: 좌측 일러스트(약 40%) + 우측 [이름·칭호·종족·직업 헤더 → `info` 블록들] / 하단: `main` 블록들이 좌우 꽉 차게 세로로 쌓임 |
| vertical | 세로형 모바일 | w 720, **h 자동**(최소 1280) | 단일 세로 열: 중앙 상단 일러스트 → 이름·칭호·종족·직업 → `info` 블록들 → `main` 블록들, 모두 전체 폭. 좌우 분할 없음 |
- 블록 렌더: 내장 섹션은 parts 사용, customBlock `text` → 제목 + 본문(줄바꿈 유지: `white-space: pre-wrap`), `list` → 제목 + 글머리 목록. 마커 `cs-f-<key>` / 사용자 블록은 `cs-b-custom`.
- 출력 순서는 `layout.info`, `layout.main` 순서를 정확히 따른다. 숨김(`hidden`) 블록은 건너뛴다.
- `PALETTE_TOKENS`(두 양식 공통): `bg`(바탕), `panel`(블록 배경), `text`, `muted`(보조 글자), `accent`, `title`(이름·제목 글자), `line`(구분선·테두리), `chip`(태그 배경). 루트 style에 `--c-<token>`으로 출력, CSS는 모두 이 변수를 사용. `accent` 토큰이 지정되면 accentColor보다 우선.
- **자동 높이**: 템플릿 `size.h`는 `null`, `size.minH` 지정. 루트 style에는 `width`와 `min-height`만. 앱은 미리보기 DOM의 실제 높이를 측정해 이미지 저장 크기(`computeOutputSize({w, h: 측정값})`)와 래스터 viewBox에 사용. HTML 내보내기는 자연 높이.

## v2 앱 UI
- **항목 관리 패널**(모든 양식): 항목마다 [사용 토글] [항목명 입력(placeholder=기본 라벨)]. 이름·이미지는 토글 없음.
- **사용자 항목**(모든 양식): [항목명][값][삭제], "+ 항목 추가"(최대 8).
- **블록 배치 패널**(clean/vertical 선택 시에만 표시): 영역 `정보 영역` / `본문 영역` 목록, 블록마다 [↑][↓][영역 이동][사용 토글](내장)·[삭제](사용자 블록), "+ 텍스트 블록", "+ 목록 블록"(최대 12), 사용자 블록 제목·본문/목록 편집.
- **세부 색상 패널**(clean/vertical 선택 시에만): 토큰 8종 color input + 각 [기본값], [모두 기본값].
- 모바일(≤899px) 편집기는 1단, 미리보기가 위.

## v1 리뷰 반영 (v2에 포함)
- 매거진 마스트헤드 "PERSONA" → 실존 작품과 겹치지 않는 가상 단어 `LUMEN`.
- streamer `defaultAccent` `#9146ff` → `#ff5a7a`.
- `readImageSize(bytes)`(순수): PNG IHDR / JPEG SOFn / WebP(VP8·VP8L·VP8X) 헤더에서 `{w,h}`, 판독 불가 → null. 앱은 디코드 전 검사: null → 거부("이미지 크기를 읽을 수 없습니다"), `w*h > 50,000,000` → 거부.
- vnode: 문자열 속성값에도 style 금지 패턴(`url(` 등) 검사.

## v2 수용 기준
- AC-20 v2 필드 정규화·마이그레이션
- AC-21 14종 모두 항목명 편집 반영
- AC-22 14종 모두 숨김 반영, name·art 숨김 불가
- AC-23 14종 모두 사용자 항목 표시·이스케이프·숨김
- AC-24 새 양식 블록 순서·영역·사용자 블록 렌더·팔레트 변수
- AC-25 accent-ink 계산·출력
- AC-26 readImageSize·해상도 제한
- AC-27 자동 높이 템플릿의 이미지 저장 크기 = 측정 높이 기반
- AC-28 편집기 UI(항목 관리·사용자 항목·블록 배치·세부 색상) 동작
- AC-29 세로형 모바일이 390px 폭 화면 미리보기에서 가로 스크롤 없이 표시

## v2 rev.2 — spec-reviewer BLOCK 반영 (이 절이 위 v2 절보다 우선)

### id 규칙
- 형식 `^[a-z0-9-]{1,24}$` **그리고** 예약어가 아님. 예약어 = `BLOCK_KEYS` ∪ `HIDEABLE_KEYS` ∪ {`name`,`art`,`custom`,`constructor`,`prototype`,`__proto__`,`tostring`,`valueof`,`hasownproperty`}.
- 무효·예약어·(customFields와 customBlocks **통틀어**) 중복 → `genId()`로 재발급. 재발급 값도 같은 검사를 통과해야 하며 최대 20회 시도, 실패 시 해당 항목 제거.
- API: `normalizeCharacter(raw, { genId } = {})`. 기본 genId = `'b-' + crypto.randomUUID().slice(0, 8)`.
- 블록·항목 조회는 `Map`/`Set`만 사용(일반 객체 조회 금지).

### 정규화 순서 (공백뿐인 문자열 = 빈 값)
- customFields: 비객체 제거 → label·value 비문자열 → '' → trim → label·value 모두 빈 항목 제거 → 길이 잘림(20/60) → 앞에서 8개 → id 검사·재발급(앞 항목이 우선 유지).
- customBlocks: 비객체 제거 → kind 무효 → 'text' → title trim·30자, body 비문자열 → '' 이고 앞뒤 공백만 trim(내부 줄바꿈 유지)·600자 → items: 비배열 → [], 문자열만, trim, 빈 값 제거, 60자, 앞 10개 → **kind 'text'면 items=[], kind 'list'면 body=''** → title·body·items 모두 빈 블록 제거 → 앞에서 12개 → id 검사·재발급. *(rev.4로 대체)*
- layout: 비객체 → `DEFAULT_LAYOUT` 복사. `info`/`main` 비배열 → []. 원소는 문자열이고 BLOCK_KEYS 또는 **정규화 후** 존재하는 customBlock id만. info를 먼저, 그다음 main을 훑으며 첫 등장만 유지. 이어서 (1) 빠진 내장 섹션을 `DEFAULT_LAYOUT` 순서대로 각자의 기본 영역 끝에 추가, (2) 빠진 customBlock을 customBlocks 순서대로 main 끝에 추가. *(rev.4로 대체: 비객체도 복구 단계 수행)*
- palettes: 비객체 → {}. 키는 `PALETTE_TEMPLATES`(`clean`,`vertical`)만 own-property로 읽음, 각 값 객체의 키는 `PALETTE_TOKENS`만, 값은 `#rrggbb`(대소문자 무관 → 소문자), 무효 → 키 제거, 빈 객체가 되면 템플릿 키 제거.
- `HIDEABLE_KEYS`에 `profile` 추가.

### 마커·영역 규약 (새 양식)
- 루트 아래 헤더: `cs-f-name`, `cs-f-title`, `cs-f-race`, `cs-f-role`, `cs-f-art`, `cs-f-icon`(헤더 전용).
- 영역 컨테이너: `cs-area-info`, `cs-area-main`(이 순서로 등장). **블록 요소는 영역 컨테이너의 직계 자식**이며 내장 블록은 `cs-f-<key>`, 사용자 블록은 `cs-b-custom cs-b-<id>` 클래스를 가진다.
- `profile` 블록 = 나이·성별·소속·키·생일 행 + 사용자 항목 행(종족·직업은 헤더에만, 중복 출력 금지). 마커 `cs-f-profile`, 내부 행은 기존 `cs-f-<key>`/`cs-f-custom`.
- 루트 style에는 8개 토큰을 **항상**(사용자 값 또는 템플릿 기본값) `--c-<token>:#rrggbb`로 출력.
- `--accent-ink`는 실제 사용되는 강조색 기준: 새 양식은 `palettes[id].accent` → `accentColor` → 템플릿 기본 순, 기존 12종은 `accentColor` → 템플릿 기본.

### 항목명 규약 (14종)
- `LABELED_KEYS` = `age, gender, affiliation, height, birthday, likes, dislikes, backstory, skills, stats` — 이 키의 마커가 출력되면 그 마커 요소 **내부**에 `vm.label(key)` 텍스트 노드가 있어야 한다. 라벨이 바뀌면 기본 라벨 텍스트 노드는 출력하지 않는다.
- `stats`는 숨기지 않으면 14종 모두 표시.

### 크기 (자동 높이 포함)
- `resolveBaseSize(size, measuredH)` (순수, size.js): `size.h`가 수이면 `{w, h}` 그대로; 자동 높이면 `measuredH`가 유한 양수일 때 `max(size.minH, ceil(measuredH))`, 아니면 `size.minH`.
- 앱은 미리보기 시트의 `scrollHeight`(transform 영향 없음)를 measuredH로 사용하고, 래스터 viewBox·출력 크기 모두 `resolveBaseSize` 결과 기준.
- **모든 프리셋에 긴 변 6000 상한**: 1x/2x/3x 결과의 긴 변이 6000 초과 시 custom 규칙과 동일하게 `width = floor(6000·w/max(w,h))`, `height = round(width·h/w)`.

### v1 문구 갱신
- v1 "필수 표시" 규칙은 **숨기지 않은 경우에 한한다**(name·art는 항상). AP-008은 hidden이 빈 데이터로 검사한다.

### rev.3 보완
- **강조색 결정**(새 양식): `--c-accent` = `palettes[id].accent` → `accentColor` → 템플릿 기본 순의 첫 유효값. `--accent`도 같은 값, `--accent-ink`는 이 값 기준. (기존 12종은 `accentColor` → 템플릿 기본)
- `isImageTooLarge({w,h})`: `w`·`h`가 양의 정수가 아니거나 `w*h > 50,000,000`이면 true.
- 파일 레이아웃 추가: `src/core/color.js`(`accentInk`, 상대 휘도), `src/core/image-size.js`(`readImageSize`, `isImageTooLarge`), `src/templates/clean.js`, `src/templates/vertical.js`, `src/templates/blocks.js`(새 양식 공용 블록 렌더러).
- 루트 요소 직렬화 순서: `<div class="..." style="...">` — `class` 다음 `style` (테스트가 이 순서를 전제).
- 새 양식에서 `--accent`는 `--c-accent`와 같은 값.

### rev.4 — v2 code-review 반영
- **빈 사용자 블록 유지**: customBlocks 정규화에서 "title·body·items 모두 빈 블록 제거" 단계를 **삭제**한다. 빈 블록은 데이터·layout·편집기 목록에 남고(12개 상한에 포함), **시트 렌더 시에만 건너뛴다**. (편집 중 내용을 지웠다가 다시 쓰는 경우 블록이 사라지지 않게 하기 위함)
- **비객체 layout 복구**: layout이 비객체여도 `{info:[], main:[]}`에서 출발해 기본 섹션·customBlock 보충 단계를 똑같이 수행한다(사용자 블록이 배치에서 빠지지 않음).
- **6000 상한 우선**: `computeOutputSize`의 최소 폭은 `min(MIN_WIDTH, maxWidth)` — 긴 변 6000 상한이 300px 최소 폭보다 우선.
- vnode 문자열 속성 금지 패턴 검사는 `class`·`alt`를 제외한다(값은 항상 이스케이프되며 CSS·URL로 해석되지 않음).

---

# v3 — 이미지 URL 등록 (2026-10-25, 사용자 승인: 두 사이트 적용, HTML 기본 "파일에 포함", 완료 후 배포)

## 공통 URL 검증 (`src/core/image-url.js`, 순수)
`validateImageUrl(input)` → `{ok:true, value: href}` | `{ok:false, error}`, throw 안 함:
- 문자열이 아니면 실패. 앞뒤 공백 trim 후 길이 1–2048.
- trim 후에도 공백·제어문자(`[\s\u0000-\u001f\u007f]`) 포함 시 실패.
- `new URL()` 파싱 실패 → 실패. `protocol === 'https:'`만 허용(http, javascript, data, blob, file 등 거부).
- `username`/`password` 있으면 실패, `hostname` 비면 실패.
- 성공 값은 `URL#href`(정규화된 문자열).

## 이미지 우선순위·UI
- 각 이미지 칸에 [파일 업로드] / [이미지 URL] 입력. 파일을 올리면 그 칸의 URL은 지워지고, URL을 적용하면 업로드 이미지는 해제된다. 메모리의 업로드 이미지가 URL보다 우선.
- URL 이미지는 `crossOrigin = 'anonymous'`로 로드. 로드 실패(CORS 거부·404·형식 오류) → "이 이미지는 원본 사이트가 외부 사용을 허용하지 않거나 열 수 없습니다. 파일로 업로드해 주세요"(문구 조정 가능) 표시, 기존 이미지 유지.
- URL은 데이터에 저장(localStorage)되어 새로고침 후 다시 로드된다. 업로드 파일은 기존처럼 저장하지 않음.

## 캐릭터 시트 전용
- `CharacterData`에 `artUrl`, `iconUrl` 추가(규칙은 학생증 photoUrl과 동일, 무효 → `''`).
- **vnode src 규칙 확장**: `src`는 (a) 기존 `data:image/(png|jpeg|webp);base64,…` 또는 (b) `validateImageUrl(src).ok && .value === src`인 https URL. 그 외 throw. `toHtml`·`toXhtml`·`toDom` 공통.
- view-model의 `images.art`/`images.icon`은 data URL 또는 https URL(검증된 값) 또는 null. 앱은 업로드 이미지 > URL 순으로 결정.
- **HTML 내보내기 옵션** `exportHtml(data, images, template, { imageMode })`, `imageMode` = `'embed'`(기본) | `'link'`:
  - `embed`: 이미지가 모두 data URL이어야 함. https URL이 남아 있으면 `{ok:false}`(앱이 먼저 URL 이미지를 data URL로 변환해서 넘김). CSP meta `default-src 'none'; style-src 'unsafe-inline'; img-src data:`.
  - `link`: data URL과 검증된 https URL 허용. CSP meta `default-src 'none'; style-src 'unsafe-inline'; img-src data: https:`.
  - 두 모드 모두 `<script`, `<link`, `@import`, CSS `url(` 금지 유지. `https:`는 오직 `<img src="...">` 속성값과 CSP meta 안에만 등장할 수 있다.
  - 미지 imageMode → `'embed'`.
- **앱**: 내보내기 영역에 "이미지: 파일에 포함 / 링크 유지" 선택(기본 파일에 포함). 파일에 포함·이미지(PNG/JPEG) 저장 시 URL 이미지는 `fetch(url, {mode:'cors'})` → Blob → 기존 업로드와 같은 축소·data URL 변환을 거친 뒤 사용. 변환 실패 → "원본 사이트가 외부 저장을 허용하지 않아 포함할 수 없습니다. '링크 유지'를 선택하거나 파일로 업로드해 주세요" 표시, 다운로드 중단. 이미지 저장(래스터)은 항상 변환된 data URL 사용(SVG 이미지 안에서는 외부 이미지가 로드되지 않음 [K]).
- 테스트: `test/ap-039.test.js`(validateImageUrl), `test/ap-040.test.js`(schema URL 필드), `test/ap-041.test.js`(vnode src 확장), `test/ap-042.test.js`(exportHtml 모드·CSP·금지 패턴).
- (rev.2) CSP meta 정확한 형식: `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">`(embed) / `... img-src data: https:">`(link) — `<head>` 안, `<style>`보다 앞, 정확히 1개.
- (rev.2) **래스터 가드**: `raster.js`의 진입 함수는 vm의 이미지 src가 모두 data URL(또는 null)이 아니면 즉시 실패를 반환(조용한 빈칸 방지). 이미지(PNG/JPEG) 저장은 내보내기 모드 선택과 무관하게 항상 URL 이미지를 data URL로 변환해서 사용. 순수 가드 함수 `assertRasterImages(images)`(→ `{ok}`)를 `src/core/`에 두고 테스트(`test/ap-043.test.js`).
- (rev.2) URL → data URL 변환: `fetch(url, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' })`, 응답 Content-Type이 image/jpeg·png·webp가 아니거나 20 MiB 초과면 실패, 이후 기존 업로드와 같은 해상도 검사·축소.
- (rev.2) URL 로드 실패 시 입력값·저장값은 유지, 이미지 칸은 이전 이미지 또는 내장 일러스트/엠블럼, 오류 문구 표시. ap-002의 `V2_DEFAULTS`에 `artUrl:''`, `iconUrl:''` 포함으로 갱신.

---

# v4 — 시트 가로 폭 조절 (2026-10-25, 사용자 승인: 고정 레이아웃은 비율 유지 확대·축소, 400~2400px, 완료 후 배포)

## 데이터
- `sheetWidths`: `{ [templateId]: number }`. 비객체 → `{}`. 키는 `TEMPLATE_IDS`만 own-property로 읽음. 값은 `typeof number`·유한수만, `Math.round` 후 `[400, 2400]`이 아니면 키 제거(clamp 아님). 그 외 → 키 제거. 기존 데이터 → `{}`.
- 상수(size.js): `SHEET_WIDTH_MIN = 400`, `SHEET_WIDTH_MAX = 2400`.

## 실제 적용 크기 (`size.js`, 순수)
`effectiveSize(template, sheetWidths)` →
- 폭 `w` = `sheetWidths[template.id]`(유효할 때) 또는 `template.size.w`.
- **고정 레이아웃**(`size.h`가 수): `{ mode: 'scale', w, h: Math.round(size.h * w / size.w), scale: w / size.w, baseW: size.w, baseH: size.h }`.
- **블록형**(`size.h === null`): `{ mode: 'reflow', w, h: null, minH: size.minH, scale: 1, baseW: w, baseH: null }`.
- `resolveBaseSize`는 이 결과를 받는다: scale 모드는 `{w, h}` 그대로, reflow 모드는 기존 규칙(측정 높이, minH 하한).

## 렌더
- **reflow 템플릿**: `sheet()` 루트 style의 `width`가 `effectiveSize().w`(vm에 `vm.sheetWidth`로 전달). 고정 템플릿 루트는 기존 기본 크기 그대로.
- **scale 래퍼**(`src/core/scale-wrap.js`, 순수): `scaleWrap(sheetVNode, eff)` — `eff.mode === 'scale' && eff.scale !== 1`이면
  `<div class="cs-scale-frame" style="width:{w}px;height:{h}px;overflow:hidden"><div class="cs-scale-inner" style="width:{baseW}px;height:{baseH}px;transform:scale({scale});transform-origin:0 0">{sheet}</div></div>`,
  아니면 시트를 그대로 반환. scale 값은 소수 4자리까지(`Number(scale.toFixed(4))`).
- 미리보기·HTML 내보내기·이미지 저장 세 경로 모두 `scaleWrap(render(vm), eff)`를 사용한다. 미리보기 화면 맞춤 축소는 래퍼 바깥(기존 방식)에서 계속 적용.
- **HTML 내보내기**: 화면 맞춤(fitCss)·`@page`·인쇄 크기는 `effectiveSize` 기준(reflow는 w × minH).
- **이미지 저장**: 래스터 viewBox와 출력 크기 계산의 base = `resolveBaseSize(effectiveSize(...), 측정 높이)`. 1x = 바뀐 폭 기준.
- **깔끔한 양식(clean)**: 루트에 `container-type:inline-size`, `@container (max-width:760px)`에서 상단(일러스트+정보) 2단 → 1단(일러스트 위, 정보 아래). 세로형은 원래 1단이라 변경 없음.

## UI
- 디자인 패널에 "시트 가로 폭": 프리셋 select(기본 / 75% / 125% / 150% / 직접 입력) + 숫자 입력(400~2400, 직접 입력일 때만 활성) + [기본 폭] 버튼 + 현재 크기 표시(예: "1200 × 1697 px", reflow는 "800 px × 자동").
- 프리셋 % 값은 기본 폭 × 비율을 반올림한 뒤 [400, 2400]으로 clamp.
- 값은 디자인별로 저장(sheetWidths), [기본 폭]은 해당 키 삭제.

## 테스트
- `test/ap-044.test.js` sheetWidths 정규화, `ap-045` effectiveSize·resolveBaseSize 연동, `ap-046` scaleWrap·exportHtml 래퍼/print/reflow 폭, `ap-047` clean 컨테이너 쿼리, `ap-048` UI 프리셋 계산 순수 함수 `presetWidth(baseW, preset)`.
- (v4 rev.2) vm에는 `vm.sheetWidths`(정규화된 객체)를 넘기고 `sheet()`가 `vm.sheetWidths[meta.id]`를 조회해 reflow 템플릿의 루트 width를 정한다(buildViewModel은 템플릿 id를 모름). `sampleCharacter()`는 `sheetWidths:{}` 포함.
- (v4 rev.2) `.cs-scale-frame{flex:none}`(미리보기 flex 안에서 줄어들지 않게). 미리보기 맞춤 축소는 `resolveBaseSize(effectiveSize(...), 측정 높이)` 기준.
- (v4 rev.2) clean의 `@container (max-width:760px)`는 컨테이너 content box 기준이므로 실제로는 시트 폭 약 864px 이하(좌우 패딩 104px 제외)에서 1단이 된다. AP-049는 이 기준으로 확인.
