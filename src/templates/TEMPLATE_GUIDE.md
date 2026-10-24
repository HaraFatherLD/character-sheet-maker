# 템플릿 작성 가이드

14개 디자인은 각자 **자기 파일 하나**(`src/templates/<id>.js`)만 수정한다. 레지스트리(`index.js`), `parts.js`, `blocks.js`, `src/core/*`, 테스트, 다른 템플릿은 수정 금지(문제가 있으면 보고만).
`fantasy.js`·`scifi.js`가 완성된 참고 예시이고, `clean.js`·`vertical.js`는 v2 규약(항목명·숨김·사용자 항목·`--accent-ink`)을 모두 지키는 최신 참고 예시다(이 둘과 `blocks.js`는 블록 기반 새 양식이라 편집 대상이 아님).

## 1. 계약
파일은 `export default { id, label, size:{w,h}, defaultAccent, css, render }`. id/label/size는 SPEC 표 값을 바꾸지 않는다.
- `defaultAccent`: 소문자 `#rrggbb`. 사용자 색이 없을 때 `--accent`로 쓰인다.
- `css`: 정적 문자열(JS 템플릿 리터럴). `render(vm)`은 VNode를 돌려준다.
- 루트는 반드시 `sheet(META, vm, ...children)` → `div.cs-sheet.cs-<id>`. style에 `width`/`height`(px), `--accent`, `--accent-ink`(강조색 위 글자색)가 자동으로 들어간다(`class` 다음 `style` 순서).
- 자동 높이 양식(clean, vertical)만 `size:{w, h:null, minH}`이며 루트 style에 `height` 대신 `min-height`가 나간다. 기존 12종은 고정 크기.
- `vm`의 모양은 `src/core/view-model.js`의 `ViewModel` JSDoc 참고(텍스트 14종, tags, skills, stats[6], art, icon, `label(key)`, `isHidden(key)`, `customFields`).

## 2. parts API (`./parts.js`, 모두 `extraClass` 선택 인자 지원)
- `sheet(meta, vm, ...children)` 루트 / `cls(...names)` 클래스 결합
- `textField(vm, key, tag='div', extraClass)` 값만 출력(마커 포함). 선택 필드가 비었거나 **사용자가 숨겼으면** `null`(`name`은 항상 출력)
- `fieldRow(vm, key, label)` / `fieldRows(vm, keys)` 라벨+값 행. 라벨은 사용자가 고친 값 → 인수 `label` → 기본 라벨 순. 숨김이거나 선택 필드가 비면 `null`(라벨 포함)
- `customRows(vm, extraClass)` 사용자 항목 행 **배열**(`div.cs-row.cs-f-custom` > `.cs-label` + `.cs-value`). 값이 있는 항목만, `custom`을 숨기면 빈 배열. 자리가 좁으면 `customRows(vm).slice(0, n)`(n ≥ 2)
- `tagList(vm, extraClass, head)` · `skillList(vm, extraClass, head)` 비었거나 숨겼으면 `null`
- `statBars(vm, extraClass, head)` 막대 / `statRadar(vm, extraClass, head)` 육각 레이더 + 텍스트 목록. 숨기면 `null`. 라벨·값은 각각 별도 `span`
  - `head`(선택): 마커 요소 **안쪽** 첫 자식으로 들어가는 VNode. `statBars(vm, '', sectionLabel(vm, 'stats'))`처럼 섹션 라벨을 마커 안에 넣을 때 쓴다(`skillList`·`tagList`는 `li.cs-skills-head`/`li.cs-tags-head`로 감싸짐).
- `artSlot(vm)` 업로드 이미지(`<img>`, object-fit/position 반영) 또는 내장 SVG 일러스트(숨길 수 없음)
- `iconSlot(vm)` 업로드 아이콘 또는 이름 첫 글자 엠블럼(아이콘 자리가 있는 디자인만). 숨기면 `null`
- `quoteBlock(vm)` 대사(숨기면 `null`) / `sectionTitle(text)` 고정 문구 제목 / `sectionLabel(vm, key)` **편집 가능한** 섹션 제목(`vm.label(key)`가 독립 텍스트 노드, 숨겼으면 `null`)
- `FONT_SANS`, `FONT_SERIF`, `FONT_MONO` CSS 글꼴 스택(CSS 문자열에 `${...}`로 삽입). `REQUIRED_KEYS`, `FIELD_LABELS`(기본 라벨, 수정 반영은 `vm.label`)

## 3. 마커 규칙 (`cs-f-<key>`)
- 필수(항상 출력, **사용자가 숨기지 않은 경우**): `title race role quote summary stats`. `name`·`art`는 숨길 수 없으므로 항상. 값이 비어도 마커는 남는다.
- 선택(값이 비면 마커 요소 전체 생략, 라벨 포함): `age gender affiliation height birthday likes dislikes backstory tags skills`.
- 숨김 가능 키(`HIDEABLE_KEYS`): `title age gender race role affiliation height birthday quote likes dislikes summary backstory tags stats skills icon custom profile`. 숨기면 그 마커 요소를 출력하지 않는다.
- 직접 만든 요소도 값을 **마커 요소 안에** 넣고, 필수 6개는 값 전체를 한 텍스트로 출력한다(자르기는 CSS로만).
- 능력치 6개는 라벨과 표시값(`16 (+3)` 등)이 각각 독립 텍스트 노드여야 한다. 시각 요소는 추가 가능.
- `cs-f-icon`은 아이콘 자리가 있을 때만. 일부 선택 필드를 디자인에서 안 보여줘도 되지만 보여주면 위 규칙을 따른다.

## 4. VNode 규칙
`h(tag, attrs, ...children)`만 사용. 허용 태그: div span p h1-h4 ul ol li img section header footer figure figcaption strong em small br hr svg path circle rect line polygon polyline g text.
허용 속성: class style src alt viewBox d cx cy r x y x1 y1 x2 y2 width height points fill stroke stroke-width opacity transform text-anchor font-size rx ry aria-hidden role.
`style`은 객체(`{ width: '10px' }`)만, 값에 `url( ; { } < > " ' \ @ /* expression` 금지. `class`·`alt`를 뺀 모든 문자열 속성값(`fill`, `transform` 등)에도 같은 금지 패턴이 적용된다. 문자열 HTML을 만들지 않는다. svg에는 defs/gradient 태그가 없으므로 그라데이션은 CSS로.

## 5. CSS 규칙
- 모든 선택자는 `.cs-<id>` 아래로 범위 지정(루트 자체는 `.cs-<id>`). `:root`·`body`·전역 선택자 금지.
- 금지 문자열(소문자 비교): `url(` `@import` `http:` `https:` `expression` `</style`. 웹폰트 금지, 이미지 파일 참조 금지: 그라데이션·border·box-shadow·clip-path·인라인 SVG만.
- JS 템플릿 리터럴이므로 백슬래시 이스케이프(`\2726` 등) 대신 문자를 그대로 쓴다.
- 글꼴은 `FONT_*` 스택만. 공통 CSS가 `.cs-sheet`에 reset을 깔아 두며(`:where`, 특이도 0) 템플릿 규칙이 항상 이긴다.
- 넘침 방지: 고정 px 레이아웃, 블록마다 `min-height:0; overflow:hidden`, 긴 텍스트는 `cs-clamp-1..6,8,10` 클래스(또는 직접 `-webkit-line-clamp`). 줄임이 걸린 요소에는 padding·`::before/::after`를 두지 말고 감싸는 요소에 둔다.
- 최대 길이(name 40자, summary 300자, backstory 1500자, 스킬 6개, 태그 8개, 사용자 항목 8개)에서도 시트 밖으로 나가지 않아야 한다.
- 색은 `var(--accent)`를 기본으로 사용(사용자가 바꿀 수 있음). `color-mix()` 사용 가능. **강조색을 배경으로 깐 곳의 글자는 `var(--accent-ink)`**.

## 6. 검증
- `npm test` → `# fail 0` (AP-007 레지스트리, AP-008 보안·마커, AP-009 내보내기, AP-023 항목명, AP-024 숨김, AP-025 사용자 항목, AP-027 accent-ink가 템플릿을 검사).
- `node scripts/check-size.mjs` → 파일 300줄 이하(함수 50줄 이하는 직접 지킨다).
- 브라우저 확인은 메인 세션이 담당: 12종 × (샘플, 최대 길이)에서 필수 마커가 루트 안에 보이는지.

## 7. v2 retrofit checklist (기존 12종 개조용)
v2에서 `parts.js`가 이미 해 주는 것: 숨김 처리(`textField`·`fieldRow(s)`·`tagList`·`skillList`·`statBars`·`statRadar`·`quoteBlock`·`iconSlot`이 `null`), 행 라벨(`fieldRow(s)`는 `vm.label`), `--accent-ink`(`sheet()`). 템플릿 **자체 마크업**이 남은 부분이므로 아래를 점검한다.
1. **모든 화면 라벨은 `vm.label(key)`.** 항목명(나이, 소속, 좋아하는 것…)과 섹션 제목(능력치, 스킬, 배경 이야기, 프로필…)에 하드코딩 문자열을 쓰지 않는다. 장식용 영문 부제(`STATS`, `// LOG`)는 허용되지만 `vm.label(key)` 텍스트 노드가 **반드시 함께** 출력되어야 한다(기본 라벨은 사용자가 고치면 사라져야 한다: `>능력치<` 같은 고정 텍스트 노드 금지).
2. **섹션 제목은 `sectionLabel(vm, key)`.** 고정 문구용 `sectionTitle('…')`는 장식 문구에만 쓴다. 숨긴 항목의 제목·장식 래퍼도 함께 생략한다(빈 상자 방지).
3. **`LABELED_KEYS`(`age gender affiliation height birthday likes dislikes backstory skills stats`)의 마커 요소 안**에 `>라벨<` 텍스트 노드가 있어야 한다(마커 시작 태그에서 1500자 이내). `stats`·`skills`는 14종 모두 표시되어야 한다.
   - 능력치/스킬: `statBars(vm, '', sectionLabel(vm, 'stats'))`, `skillList(vm, '', sectionLabel(vm, 'skills'))`의 `head` 인수를 쓰거나, 마커 클래스(`cs-f-stats`)를 가진 자체 래퍼 안에 `sectionLabel`을 넣는다.
   - 값만 찍던 필드(`backstory`, `affiliation` 등): `fieldRow`로 바꾸거나 라벨을 마커 요소 안에 넣는다.
4. **`customRows(vm)`을 프로필/정보 영역에 배치**한다. 값 있는 사용자 항목이 앞에서부터 최소 2개는 `cs-f-custom` 행으로 보여야 한다(좁으면 `.slice(0, n)`, n ≥ 2). 값이 비면 행이 없고, `custom`을 숨기면 0개다.
5. **`vm.isHidden(key)` 존중.** `parts`를 거치지 않고 직접 만든 마커 요소(예: storybook의 `cs-stats-hearts cs-f-stats`)는 `vm.isHidden('stats')`이면 만들지 않는다. `name`·`art`는 항상 출력.
6. **강조색 배경 위 글자는 `var(--accent-ink)`.** 강조색이 `#ffffff`/`#000000`이어도 읽혀야 한다.
7. 확인: `npm test`(특히 AP-023·024·025·027)와 `node scripts/check-size.mjs`. 사용자 입력은 모두 `h()` 자식/속성으로만 흘려보내 이스케이프 경로를 지킨다.
