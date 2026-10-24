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

## v3 — 이미지 URL 등록 (2026-10-25)
> 실행: ralph-executor | 유형: Type B | 기준: SPEC.md `# v3` + rev.2, ACCEPTANCE_PREDICATES.md `# v3 Acceptance Predicates`
> 제약: 제공된 테스트 파일 수정 금지, 설치/커밋/브라우저 사용 금지

### 판별식 상태 (v3)
| AP ID | 설명 | 유형 | 상태 | 시도 | 최근 실패 사유 |
|-------|------|------|------|------|--------------|
| AP-039 | validateImageUrl (ap-039 3개 + ap-039b 4개: 정규화 href 2048자 제한, 멱등성) | Auto | ✅ pass | 1 | — |
| AP-040 | normalizeCharacter artUrl/iconUrl (+ ap-002 V2_DEFAULTS, ap-001 샘플 왕복) | Auto | ✅ pass | 1 | — |
| AP-041 | vnode src: 검증된 https 허용(이스케이프), 그 외 throw | Auto | ✅ pass | 1 | — |
| AP-042 | exportHtml imageMode embed/link, CSP, 금지 패턴 | Auto | ✅ pass | 1 | — |
| AP-043b | assertRasterImages | Auto | ✅ pass | 1 | — |
| AP-006 (기존) | vnode src: 데이터 URL 또는 검증된 https URL (거부 목록의 `https://x/y.png`가 `http://x/y.png`로 수정됨) | Auto | ✅ pass | 2 | — (테스트-SPEC 모순 해소) |
| AP-043 | 브라우저: URL 미리보기/내보내기/새로고침 | Semi | ⏳ pending | 0 | 메인 세션(브라우저) 담당 — 앱 계층 로직은 ap-043c~f로 자동 검증 |
| AP-044 | 배포 URL 200 | Semi | ⏳ pending | 0 | 배포 후 |

### 현재 상태 (v3)
- Iteration: 4
- Auto AP 전부 통과: `npm test` `# tests 144 / # pass 144 / # fail 0` (v3 대상 ap-039, 039b, 040, 041, 042, 043, 043c~043f + ap-002 갱신분, 기존 ap-006 포함)
- 에스컬레이션: 없음
- 검사: check-size exit 0(모든 파일 ≤ 300줄), check-no-html-sink exit 0, audit-v2 exit 0, 최장 함수 41줄, export 함수 73개 JSDoc 확인

### 루프 히스토리 (v3)
#### Iteration 1
- 구현:
  - core: `image-url.js`(validateImageUrl), `raster-guard.js`(assertRasterImages), `vnode.js`(isDataImageSrc/isHttpsImageSrc/isImageSrc, src 규칙 확장), `schema.js`(artUrl/iconUrl, 무효 → ''), `sample.js`, `view-model.js`(문서), `export-html.js`(imageMode embed|link, CSP meta, embed에서 원격 이미지 거부)
  - app: `url-image.js`(fetch → Content-Type·20MiB 검사 → 기존 헤더 크기 가드·축소·dataURL), `image-flow.js`(업로드 > URL 우선, 적용/지우기/제거, 미리보기 로드 실패 폴백, 내보내기용 변환), `form-media.js`(URL 입력 + 적용/지우기, "이미지: 파일에 포함 / 링크 유지"), `app.js`, `dom.js`(https img에 crossOrigin/referrerPolicy를 src 전에 설정), `raster.js`(진입 가드), `images.js`, `form.js`(문서), `style.css`(.url-row)
- /verify: PASS — `npm test` `# tests 106 / # pass 105 / # fail 1`, check-size / check-no-html-sink / audit-v2 exit 0
- AP 평가: AP-039 ✅ AP-040 ✅ AP-041 ✅ AP-042 ✅ AP-043b ✅ AP-002 ✅ / AP-006 ❌(모순)
- 통과율: 105/106
- 수정 계획: 모순은 "테스트 수정 금지, 모순이면 중단·보고" 규칙에 따라 사용자 보고. 나머지는 코디네이터 피드백 반영.

#### Iteration 2 (코디네이터 피드백: 형제 프로젝트 리뷰 반영)
- 구현:
  - `validateImageUrl`: 입력이 2048자 이하여도 정규화된 `href.length > 2048`이면 거부(한글 등은 %XX 9자로 늘어나 저장 후 재검증에서 조용히 사라지는 문제 방지). 성공 값은 재검증해도 같은 값(멱등). 새 테스트 `test/ap-039b.test.js` 4개: 입력 ≤ 2048·href > 2048 거부, 정규화 경계 2048/2049, 멱등성, schema 제거 + vnode throw.
  - 15초 타임아웃(`IMAGE_LOAD_TIMEOUT_MS`, 단일 출처): `fetchImageAsDataUrl`은 AbortController로 15초 뒤 중단하고 다른 로드 실패와 같은 경로(EMBED_FAIL 안내 + 다운로드 중단). 미리보기 `<img>`는 15초 뒤에도 `complete`가 아니면 로드 오류와 동일하게 처리(내장 일러스트/엠블럼 폴백 + 안내 문구, 주소는 유지).
  - `sample.js`: `sampleCharacter()`가 이미 56줄(> 50)이었고 URL 필드 추가로 58줄이 되어, 사용자 추가분을 `sampleExtras()`로 분리(동작 동일, 41줄).
- /verify: PASS — `npm test` `# tests 110 / # pass 109 / # fail 1`, check-size / check-no-html-sink / audit-v2 exit 0, 프로젝트 밖 검증 스크립트 31개 항목 통과
- AP 평가: AP-039 ✅ AP-040 ✅ AP-041 ✅ AP-042 ✅ AP-043b ✅ AP-002 ✅ / AP-006 ❌(모순)
- 통과율: 109/110
- code-reviewer(별도 세션) 결과와 반영은 Iteration 3에 기록

#### Iteration 3 (code-reviewer 반영: 판정 WARNING, CRITICAL/HIGH 없음)
- 리뷰 결과(별도 세션, 읽기 전용): 스펙 적합(CSP 문자열·위치, embed/link, 래스터 가드, fetch 옵션, 20MiB, 문구, 우선순위, 저장)과 보안(src 규칙은 `href === 입력`인 정규형만 허용, 원격 URL이 CSS로 들어갈 길 없음, HTML sink 없음) 이상 없음. 지적 3건을 모두 반영:
  1. [MEDIUM] 내보내기 중 상태 변경: `embeddedImages()`가 최대 15초씩 await 하는 동안 사용자가 이미지를 바꾸면 옛 이미지와 새 데이터가 섞이고, 더블클릭하면 다운로드가 두 번 일어남 → 슬롯(업로드 2 + 주소 2)을 첫 await 전에 한 번만 읽고, 변환 뒤 하나라도 바뀌었으면 결과를 버리고 "내보내는 동안 이미지가 바뀌어 중단했습니다. 다시 시도해 주세요"를 표시. `app.js`에 `exporting` 플래그를 두어 동시 내보내기를 막음(finally에서 해제).
  2. [LOW] 로드 타임아웃 타이머가 현재 요소와 무관: 오래된 렌더의 타이머가 새 요소의 `complete`를 검사해 다시 시작된 로드를 일찍 실패 처리할 수 있음 → 타이머를 요소에 묶음(`img.isConnected && !img.complete`일 때만 실패; 교체된 요소는 건너뛰고 후속 요소가 자기 타이머를 가짐).
  3. [LOW] 키 입력마다 원격 `<img>`가 다시 만들어져 캐시 헤더 없는 서버는 재요청될 수 있음 → `scheduleRender`의 90ms 디바운스 조건에 저장된 주소가 있을 때도 포함. 브라우저가 문서 안에서 받은 이미지를 재사용하는지는 브라우저 의존이라 AP-043 육안 확인 항목으로 남김.
- /verify: PASS — `npm test` `# tests 110 / # pass 109 / # fail 1`(AP-006), check-size / check-no-html-sink / audit-v2 exit 0, 프로젝트 밖 검증 스크립트 34개 항목 통과(변환 중 변경 취소, 교체된 요소의 타이머 건너뜀, 두 주소 선판독 케이스 추가)
- AP 평가: 동일 (AP-006만 ❌, 테스트-SPEC 모순)
- 통과율: 109/110

#### Iteration 4 (코디네이터 후속 요청: 최종 리뷰 WARNING 반영, 테스트 우선)
- 요청: [MEDIUM] URL 입력칸의 `maxlength` 제거, [HIGH] 앱 계층 테스트 추가, [LOW] 업로드와 주소 적용의 경합(마지막 동작 우선).
- RED (코드 수정 전): 새 테스트 34개 중 7개만 실패 — `SOURCE_CHANGED` 미export 1개, `maxlength` 2개, 토큰 4개(업로드 중 주소 적용 / 업로드 중 제거 / 업로드 중 초기화 / 업로드 두 개의 역순 완료). 기존 동작을 특성화하는 나머지 27개는 처음부터 통과.
- GREEN:
  1. `form-media.js`: URL 입력칸의 `maxlength`와 불필요해진 import 제거(브라우저가 붙여넣기를 조용히 잘라 유효한 주소로 적용하던 문제). 너무 긴 주소는 `validateImageUrl`의 안내 문구로 거부되고 저장되지 않으며 입력칸에는 그대로 남는다. 처음 지시의 "maxlength 2048"을 코디네이터 지시로 대체.
  2. `image-flow.js`: 슬롯별 토큰. 업로드 시작, 주소 적용 성공, 제거, 초기화가 토큰을 올리고, 업로드 결과는 토큰이 아직 최신일 때만 반영(마지막 동작 우선). 거부된 주소와 "주소 지우기"는 토큰을 올리지 않아 진행 중인 업로드를 취소하지 않는다. `SOURCE_CHANGED`를 export(테스트용).
  3. 새 테스트(저장소): `test/app-helpers.js`(상태·fetch 응답·디코딩·타이머·가짜 DOM 스텁), `ap-043c`(image-flow 13개: embeddedImages 성공/실패 문구/SOURCE_CHANGED/주소 선판독, onLoadError 폴백과 주소 유지, 15초 타이머, 우선순위), `ap-043d`(url-image 9개: 요청 형태, Content-Type, HTTP·네트워크 오류, 스트리밍 20MiB 중단과 경계, 헤더 가드, 축소, 15초 중단), `ap-043e`(form-media 5개, 가짜 DOM: maxlength 없음, 긴 붙여넣기 거부, 적용/지우기/Enter, 업로드·제거 시 입력칸 비움, 내보내기 선택), `ap-043f`(경합 7개).
- /verify: PASS — `npm test` `# tests 144 / # pass 144 / # fail 0`, check-size / check-no-html-sink / audit-v2 exit 0, 최장 함수 41줄(sample.js), 최대 파일 src 199줄·test 215줄
- AP 평가: 전부 ✅ (AP-006은 거부 목록의 `https://x/y.png`를 `http://x/y.png`로 바꾼 한 줄 수정이 제 세션 밖에서 반영되어 통과)
- 통과율: 144/144
- 변이(mutation) 검사는 권한이 거부되어 실행하지 못했다. 새 동작 테스트는 RED 실행으로 실패를 확인했고, 특성화 테스트는 단언 내용으로만 검토했다.

### 결정·메모 (후속 에이전트용)
- [K] 사용자 입력 URL은 `validateImageUrl`(https만, 인증정보 없음, 공백/제어문자 없음, 정규화 href ≤ 2048)만 통과. vnode `src`는 `href === 입력`인 정규형만 허용 → 직렬화되는 값 = 검증된 값.
- [K] 미리보기 `<img>`는 crossOrigin='anonymous' + referrerPolicy='no-referrer'(내보내기 fetch와 같은 요청 형태). CORS를 허용하지 않는 사이트는 미리보기에서도 실패한다.
- [K] "링크 유지" HTML의 `<img>`에는 crossorigin 속성이 없어 CORS 없이도 표시될 수 있다(AP-043). 그래서 내보내기는 미리보기 실패 여부와 무관하게 저장된 주소를 사용한다. "파일에 포함"과 PNG/JPEG 저장은 미리보기 실패 여부와 무관하게 저장된 주소를 새로 fetch한다.
- 업로드는 그 칸의 URL(저장값·입력칸)을 지우고, 주소 적용은 그 칸의 업로드를 해제한다. "제거" 버튼은 업로드와 주소를 모두 지우고, "지우기"는 주소만 지운다.
- PNG/JPEG 저장은 내보내기 선택값과 무관하게 항상 변환(`embeddedImages`)하고, `rasterize` 진입 가드(`assertRasterImages`)를 한 번 더 통과해야 한다.
- 이 환경의 Bash 도구는 주석에 홀따옴표가 섞인 긴 heredoc 묶음을 파싱 오류로 거부했다(아무것도 실행되지 않음) → 여러 파일 작성은 Write 도구를 쓸 것.
- 프로젝트 밖(scratchpad)의 검증 스크립트(apply-edits.mjs, verify-extra.mjs)는 가짜 fetch/DOM으로 image-flow·url-image·dom·rasterize 가드와 함수 길이·JSDoc을 확인했다. 앱 계층의 핵심 동작은 이제 저장소 테스트(ap-043c~f)로도 고정되어 있다.
- 앱 계층 테스트는 `test/app-helpers.js`의 스텁(상태, fetch 응답, createImageBitmap+canvas, setTimeout/clearTimeout, 최소 가짜 DOM)을 쓴다. 대기 중인 이미지를 `watchPreview`에 넘기는 테스트는 반드시 가짜 타이머로 감쌀 것(진짜 15초 타이머가 프로세스 종료를 늦춘다).
- 슬롯별 토큰: `uploadImage`(시작), `applyImageUrl`(성공 시), `removeImage`, `reset`이 토큰을 올린다. `clearImageUrl`과 거부된 `applyImageUrl`은 올리지 않는다(진행 중인 업로드와 충돌하지 않기 때문).
- URL 입력칸에는 `maxlength`를 두지 않는다(코디네이터 지시, 최초 요구의 "maxlength 2048"을 대체). 브라우저가 붙여넣기를 조용히 잘라 유효한 주소로 만들 수 있기 때문.

### 해결된 사용자 결정 (참고)
- `test/ap-006.test.js:31`이 거부 목록에 `'https://x/y.png'`를 넣어 SPEC v3(b)·AP-041과 충돌했던 건은, 그 한 줄이 `'http://x/y.png'`로 수정되면서(제 세션 밖에서 반영) 해소되었다. 코드는 처음부터 SPEC대로였고 바뀌지 않았다.

### 미검증 (브라우저 필요, AP-043)
- 실제 CORS 허용/거부 사이트에서의 미리보기 표시, canvas 변환(createImageBitmap/toDataURL), 내려받은 HTML을 열었을 때의 CSP 동작, 새로고침 후 복원, 390px 폭 레이아웃.

## v4 — 시트 가로 폭 (2026-10-25)
> 유형: Type B | 사용자 승인: 고정 레이아웃은 비율 유지 확대·축소, 400~2400px | SPEC v4 + (v4 rev.2) 우선 | 브라우저 미사용, 설치·커밋 없음

### 판별식 상태 (v4)
| AP ID | 설명 | 유형 | 상태 | 시도 | 최근 실패 사유 |
|-------|------|------|------|------|--------------|
| AP-044 | sheetWidths 정규화 (2 tests) | Auto | ✅ pass | 1 | — |
| AP-045 | effectiveSize · resolveBaseSize 연동 (4) | Auto | ✅ pass | 1 | — |
| AP-046 | scaleWrap · exportHtml 래퍼/@page/reflow 폭 (3) | Auto | ✅ pass | 1 | — |
| AP-047 | clean 컨테이너 쿼리 (1) | Auto | ✅ pass | 1 | — |
| AP-048 | presetWidth (1) | Auto | ✅ pass | 1 | — |
| AP-049 | 14종 실측 크기 · HTML/이미지 저장 크기 · clean 1단 · 새로고침 · 390px | Semi | ⏳ 브라우저 필요(메인 세션) | 0 | — |
| AP-050 | 배포 반영 | Semi | ⏳ 배포 후 | 0 | — |
보강 테스트(저장소 신규, 제공 테스트는 수정하지 않음): `test/ap-049b.test.js`(5: toSheetWidth 경계, 14종 루트 폭 규칙, 14종 HTML 내보내기, 래스터 SVG 2개), `test/ap-049c.test.js`(3: 폭 컨트롤을 가짜 DOM에서 구동).

### 현재 상태 (v4)
- Iteration: 1 (같은 회차 안에서 자체 수정 2건)
- 통과율: Auto AP 5/5 (100%), `npm test` 163/163 (시작 시 150개 중 7 실패)
- 에스컬레이션: 없음

### 루프 히스토리 (v4)
#### Iteration 1
- 구현:
  - core: `size.js`(SHEET_WIDTH_MIN/MAX, WIDTH_PRESETS, `toSheetWidth`, `effectiveSize`, `presetWidth`; `resolveBaseSize`는 로직 변경 없이 유효 크기 객체를 그대로 받음), `scale-wrap.js` 신규(`scaleWrap`, `isScaled`), `schema.js`(`normSheetWidths`: 알려진 id만 own 속성으로 읽고 round 후 범위 밖은 제거), `sample.js`, `view-model.js`(`vm.sheetWidths`), `export-html.js`(scaleWrap, effectiveSize 기반 fitCss/@page, 프레임 CSS).
  - templates: `parts.js` `sheet()`(reflow 템플릿만 `effectiveSize(meta, vm.sheetWidths).w`, 고정형은 기본 루트 크기), `clean.js`(`container-type:inline-size` + `@container (max-width:760px)`).
  - app: `app.js`(`measuredBase`가 유효 크기 기준, 미리보기 `scaleWrap`), `raster.js`(`buildRasterSvg`가 래핑된 트리를 그리고 viewBox/foreignObject = 유효·측정 크기, width/height = 출력 크기), `form-width.js` 신규(프리셋 select · 숫자 입력 · [기본 폭] · 크기 표시 · 오류 메시지), `form.js`(디자인 패널에 연결), `style.css`(`.hint-error`, `.panel-subtitle`).
- /verify: PASS — `npm test` `# tests 163 / # pass 163 / # fail 0`, check-size / check-no-html-sink / audit-v2 exit 0, 최장 함수 42줄(sample.js), 최대 파일 parts.js 253줄
- AP 평가: AP-044 ✅ AP-045 ✅ AP-046 ✅ AP-047 ✅ AP-048 ✅ / AP-049 ⏳ AP-050 ⏳ (둘 다 브라우저·배포 필요)
- 통과율: 5/5 Auto (163/163 tests)
- 자체 수정: (1) 처음 쓴 `buildWidthControls`가 50줄을 넘어(약 66줄) 실행 전에 `createParts`/`makeShow`/`wire`로 분리. (2) `ap-049c`에 넣었던 의미 없는 단언 한 줄을 실제 값 검사로 교체.
- 제공 테스트와 SPEC의 모순: 없음.

### 결정·메모 (v4, 후속 에이전트용)
- [K] `ap-046`은 기본 폭·reflow 내보내기 HTML 전체에 `cs-scale-frame` 문자열이 없어야 한다고 단언한다. 그래서 `.cs-scale-frame{flex:none}`와 프레임 그림자는 **래퍼가 있을 때만** `<style>`에 쓴다(`FRAME_CSS`, 조건은 `isScaled(eff)`). 미리보기·래스터에는 flex 부모가 없어 이 CSS가 필요 없다.
- [K] `toSheetWidth`가 폭 검증의 단일 출처다: 스키마 정규화, `effectiveSize`, UI 입력 검사가 같은 함수를 쓴다(round 후 범위 확인, clamp 없음). 프리셋(%) 값만 `presetWidth`에서 clamp한다.
- [K] 시트 폭은 `vm.sheetWidths`로만 흐른다(`buildViewModel`은 템플릿 id를 모름). `buildRasterSvg(template, vm, out, base)`도 vm에서 `effectiveSize`를 계산하고, `base` 생략 시 `resolveBaseSize(eff)`를 쓴다. 이전의 `base = template.size` 기본값은 reflow에서 `h:null`이 되어 제거했다.
- [K] HTML 내보내기의 화면 맞춤 `zoom` 단계를 0.2에서 0.05까지(k=19..1)로 늘렸다. 2400px 시트가 390px 폰에서 가로 스크롤 없이 맞도록 하기 위함(0.2배로는 480px).
- [I] SPEC은 clean의 상단 1단만 명시했지만, 같은 `@container` 블록 안에서 능력치 막대·스킬의 2열도 1열로 접었다. 400px 폭에서 막대 폭이 0이 되는 것을 막기 위함이며, 쿼리 밖(864px 초과)에서는 달라지는 것이 없다.
- [K] UI 상태는 저장값에서 유도한다: 키 없음 → 기본, 기본 폭 × 75/125/150%와 같으면 그 프리셋, 아니면 직접 입력. "직접 입력"을 고르거나 숫자를 입력하면 그 디자인 id를 `typing`에 넣어, 입력한 값이 프리셋 값과 같아도 입력칸이 비활성화되지 않게 한다. 입력칸이 포커스를 가진 동안에는 값을 다시 쓰지 않는다. [기본 폭]은 키를 삭제한다.
- 앱 계층 테스트(`ap-049c`)는 `test/app-helpers.js`의 `FakeNode`를 쓴다. `FakeNode`에는 `focus/select/blur`가 없어 테스트에서 인스턴스에 빈 함수를 붙인다.

### 미검증 (브라우저 필요, AP-049)
- 14종에서 폭을 바꿨을 때 미리보기 시트의 실제 크기, HTML 저장 크기, 이미지 저장 픽셀이 `effectiveSize`와 일치하는지.
- 래스터 경로의 선명도: foreignObject 안의 `transform:scale()` + viewBox 확대가 2x/3x에서 흐려지지 않는지(코드상 viewBox와 width/height 비율은 일치).
- clean의 1단 전환 경계(시트 폭 약 864px)와, `zoom`이 걸린 HTML 내보내기에서 컨테이너 쿼리가 같은 경계로 평가되는지.
- 새로고침 후 폭 유지, 390px 모바일에서 폭 컨트롤 배치·오류 메시지, 2400px 시트의 미리보기 맞춤 축소.
- `/code-review`는 메인 세션 몫이라 실행하지 않았다.
