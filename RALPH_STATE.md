# Ralph Loop State — Character Sheet Maker MVP v1 (phase 1)
> 시작: 2026-10-24 | 유형: Type A | 범위: core + parts + fantasy/scifi 완성 + 플레이스홀더 10종 + 앱 + 가이드

## 판별식 상태
| AP ID | 설명 | 유형 | 상태 | 시도 | 최근 실패 사유 |
|-------|------|------|------|------|--------------|
| AP-001 | sampleCharacter (2 tests) | Auto | ✅ pass | 1 | — |
| AP-002 | normalizeCharacter (11) | Auto | ✅ pass | 1 | — |
| AP-003 | validateImageFile (3) | Auto | ✅ pass | 1 | — |
| AP-004 | stats (4) | Auto | ✅ pass | 1 | — |
| AP-005 | computeOutputSize (4) | Auto | ✅ pass | 1 | — |
| AP-006 | vnode toHtml/toXhtml/validateStyle (9) | Auto | ✅ pass | 1 | — |
| AP-007 | 템플릿 레지스트리 (3) | Auto | ✅ pass | 1 | — |
| AP-008 | 템플릿 보안·마커 (4) | Auto | ✅ pass | 1 | — |
| AP-009 | exportHtml (5) | Auto | ✅ pass | 1 | — |
| AP-010 | safeFilename (4) | Auto | ✅ pass | 1 | — |
| AP-011 | 검사 스크립트 (3) | Auto | ✅ pass | 1 | — |
| AP-012 | `npm test` 전체 | Auto | ✅ pass | 1 | — |
| AP-NFR-SIZE | `node scripts/check-size.mjs` exit 0 | Auto | ✅ pass | 1 | — |
| AP-013..020 | 브라우저 반자동 검증 | Semi | ⏳ pending | 0 | 메인 세션(브라우저) 담당 |
| AP-021 | 12 디자인 스크린샷 체크리스트 | Manual | ⏳ pending | 0 | 스크린샷 필요 |
| AP-NFR-VALIDATION | 경계 검증 경로 | NFR | ⏳ pending | 0 | code-reviewer 담당 |

## 현재 상태
- Iteration: 3 (phase 1 종료 조건 충족)
- Auto 통과율: 13/13 (100%) — `# tests 52 / # pass 52 / # fail 0 / # skipped 0 / # todo 0`
- 에스컬레이션: 없음
- 보조 검증(프로젝트 외부 스크래치 스크립트): 모든 src 파일 `node --check` 통과, import/export 링크 검사 통과, 함수 50줄 휴리스틱 통과,
  12 템플릿 × {샘플, 최대 길이} × {이미지 없음, 있음}에서 toHtml/toXhtml/exportHtml/래스터 SVG 문자열 생성 + XML 균형 검사 통과,
  가짜 DOM 위에서 app.js 구동(편집→미리보기, 자동 저장, 12종 전환, TRPG 전환, HTML 내보내기, 초기화, 손상 저장소→샘플) 통과.

## 루프 히스토리
### Iteration 1
- 구현: src/core 의 escape, vnode, schema, stats, size, filename, sample, sample-art, view-model
- /verify: PASS (`node --test` ap-001..006, 010: 37 tests, 0 fail)
- AP 평가: AP-001 ✅ AP-002 ✅ AP-003 ✅ AP-004 ✅ AP-005 ✅ AP-006 ✅ AP-010 ✅ / AP-007,008,009,011 ❌(템플릿·export 미구현)
- 통과율: 7/11 (64%)
- 수정 계획: common-css, export-html, parts, 레지스트리, 12 템플릿 구현

### Iteration 2
- 구현: common-css.js, export-html.js, templates/parts.js, templates/index.js, fantasy.js, scifi.js, 플레이스홀더 10종(생성 스크립트로 작성, 각 파일 자체 완결)
- /verify: PASS (`npm test`: 52 tests, 0 fail)
- AP 평가: AP-001..AP-012 ✅
- 통과율: 12/12 Auto (100%)
- 수정 계획: 앱·가이드 미구현

### Iteration 3
- 구현: src/app (dom, images, raster, download, form, form-lists, form-media, app), index.html, style.css, TEMPLATE_GUIDE.md
- /verify: PASS (`npm test` 52/52, check-size exit 0, check-no-html-sink exit 0)
- AP 평가: Auto 전부 ✅, AP-NFR-SIZE ✅
- 통과율: 13/13 Auto (100%)
- 수정 계획: 없음. 남은 것은 브라우저/수동 AP(013-021)와 /code-review

## 결정·메모 (후속 에이전트용)
- SPEC 대비 추가: `src/core/common-css.js`(공통 CSS + 글꼴 스택, 미리보기·HTML·래스터 공용), `src/app/dom.js`(toDom/el), `form-lists.js`, `form-media.js`.
- vnode: 자식은 `h()` 시점에 평탄화(null/false/''/true 제거, 숫자는 문자열), void 태그에 자식이 있으면 throw, 속성의 비유한 숫자는 throw.
  toXhtml 은 XML 불가 문자 외에 U+FFFE/FFFF·짝 없는 surrogate 도 제거(SPEC 의 상위 집합).
- exportHtml: 이름이 비면 `<title>` 은 `캐릭터 시트`. 화면 맞춤은 스크립트 없이 단계별 `@media` + `zoom`(5% 단계), 인쇄는 `@page` + `@media print`.
- 공통 CSS 는 `:where()` 로 특이도 0 (템플릿 CSS 가 항상 우선). 줄임 유틸리티 `.cs-clamp-1..6,8,10`.
- 줄임(`-webkit-box`)이 걸린 요소에는 `::before/::after`·padding 금지(감싸는 요소에 둘 것).
- 이 환경의 Bash 도구는 heredoc 안의 `\\` 를 `\` 로 줄인다 → 백슬래시가 중요한 파일은 Write 도구로 작성. python3 은 없음(node 사용).
- 레이아웃은 스크린샷 없이 치수 계산으로만 설계했다. 브라우저에서 fantasy/scifi 의 최대 길이 데이터 겹침·잘림을 우선 확인할 것.

## v2 retrofit: storybook / streamer / clean / vertical (2026-10-24)
> 담당 파일: storybook.js, streamer.js, clean.js, vertical.js, blocks.js. 나머지 템플릿은 병렬 에이전트 담당.

### Iteration 1
- 구현: storybook.js - 능력치/스킬 제목을 vm.label(sectionLabel, 마커 안)로, 배경 이야기에 마커 안 run-in 라벨, 숨기면 stats/ribbon/cloud/tale/rowd/card 래퍼까지 생략, 사용자 항목 스티커 띠(cs-customs, 최대 3), 칩 글자색 var(--accent-ink). streamer.js - STATS/CORNERS/ABOUT 장식 부제 + vm.label 텍스트 노드, 배경 이야기 마커 안 라벨, 사용자 항목을 about 카드 줄에 합류(2~4개), 숨기면 statpanel/bubble/intro/chat/chips 생략, 아바타 글자색 var(--accent-ink). clean/vertical/blocks.js는 결함 없어 변경 없음.
- 기술 검증: check-size exit 0, check-no-html-sink exit 0, 함수 50줄 초과 없음(storybook 201줄, streamer 141줄).
- AP 평가(교정한 audit 사본): storybook/streamer/clean/vertical 모두 OK. 4종으로 필터한 테스트(ap-008/009/023/024/025/026/027) 28/28 통과. 숨김/희소/최대 길이 스트레스 이상 없음.
- 실제 npm test: 91개 중 87 통과, 4 실패(AP-023 x2, AP-025 x2) - 전부 magazine(타 에이전트 담당). 레지스트리 순서상 magazine이 먼저 실패해 4종 검사가 가려지므로 필터 사본으로 확인함.
- 미해결/보고: scripts/audit-v2.mjs 12행 count()의 정규식이 템플릿 리터럴 안의 \s라서 s가 되어 어떤 템플릿도 custom-rows 0으로 나온다(\s로 고쳐야 함). clean/vertical은 실제로 cs-f-custom 2행을 출력하고 custom/profile 숨김도 정상.
- 브라우저 육안 확인 필요(메인 세션): storybook 스티커 띠가 이야기 영역을 약 44px 줄임, streamer about 줄 7카드 폭, 강조색 칩 글자색 변경.
