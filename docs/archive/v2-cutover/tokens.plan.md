# 토큰 마이그레이션 계획

## 1. src/styles-v2/tokens.css 에 들어갈 토큰

출처: `docs/redesign/prototype/tokens.css`, `docs/redesign/prototype/ide-theme.css`
(라이트 모드 기준 값. 다크 오버라이드는 § 5 참조. 충돌/alias 분석은 § 3.)

### Brand
| 토큰 | 값 | 용도 |
|---|---|---|
| `--brand` | `#4F46E5` | primary action, logo, active nav (indigo-600) |
| `--brand-hover` | `#4338CA` | primary button hover (indigo-700) |
| `--brand-light` | `#EEF2FF` | pill / filter background (indigo-50) |
| `--brand-muted` | `#818CF8` | active chip subtle border (indigo-400) |

### Surfaces (light)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#F8FAFC` | page background (slate-50) |
| `--surface` | `#FFFFFF` | cards, inputs, modals |
| `--surface-2` | `#F1F5F9` | hovered rows, tab tracks, muted fills |
| `--surface-3` | `#E2E8F0` | skeleton fills, pressed states |

### Text
| 토큰 | 값 | 용도 |
|---|---|---|
| `--text` | `#0F172A` | primary copy, headings (slate-900) |
| `--text-2` | `#334155` | secondary copy (slate-700) |
| `--text-3` | `#64748B` | tertiary / helper (slate-500) |
| `--text-4` | `#94A3B8` | placeholder, disabled (slate-400) |

### Borders
| 토큰 | 값 | 용도 |
|---|---|---|
| `--border` | `#E2E8F0` | card, table row, default input |
| `--border-2` | `#CBD5E1` | secondary button, strong input |

### Semantic
| 토큰 | 값 |
|---|---|
| `--success` | `#10B981` |
| `--success-bg` | `#ECFDF5` |
| `--success-text` | `#065F46` |
| `--warning` | `#F59E0B` |
| `--warning-bg` | `#FFFBEB` |
| `--warning-text` | `#92400E` |
| `--danger` | `#EF4444` |
| `--danger-bg` | `#FEF2F2` |
| `--danger-text` | `#991B1B` |
| `--info` | `#3B82F6` |
| `--info-bg` | `#EFF6FF` |
| `--info-text` | `#1E40AF` |

### Accent palette (eventId 해시로 회전)
| 토큰 | 값 |
|---|---|
| `--accent-indigo` | `#4F46E5` |
| `--accent-sky` | `#0EA5E9` |
| `--accent-emerald` | `#10B981` |
| `--accent-amber` | `#F59E0B` |
| `--accent-violet` | `#8B5CF6` |
| `--accent-pink` | `#EC4899` |
| `--accent-red` | `#EF4444` |

### Radius
| 토큰 | 값 |
|---|---|
| `--r-sm` | `6px` |
| `--r-md` | `8px` |
| `--r-lg` | `12px` |
| `--r-xl` | `16px` |
| `--r-full` | `9999px` |

### Elevation (shadow)
| 토큰 | 값 |
|---|---|
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)` |
| `--shadow-card-hover` | `0 12px 32px rgba(0,0,0,0.12)` |
| `--shadow-modal` | `0 20px 60px rgba(0,0,0,0.2)` |

### Typography

**Font family**
| 토큰 | 값 |
|---|---|
| `--font` | `'Geist', system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'Geist Mono', 'Fira Code', monospace` |

> Webfont: `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap')`

**Type scale**
| 토큰 | 값 | 용도 |
|---|---|---|
| `--fs-display` | `34px` | hero h1 (event list hero) |
| `--fs-h1` | `26px` | page titles (event detail) |
| `--fs-h2` | `22px` | auth page titles |
| `--fs-h3` | `18px` | section dividers |
| `--fs-lg` | `16px` | lead copy, hero subtitle |
| `--fs-md` | `15px` | body text |
| `--fs-base` | `14px` | default UI, inputs, buttons |
| `--fs-sm` | `13px` | labels, secondary |
| `--fs-xs` | `12px` | meta, badges |
| `--fs-2xs` | `11px` | tags, fine print |
| `--fs-3xs` | `10px` | pills (PRO, ADMIN) |

**Weights**
| 토큰 | 값 |
|---|---|
| `--fw-regular` | `400` |
| `--fw-medium` | `500` |
| `--fw-semibold` | `600` |
| `--fw-bold` | `700` |
| `--fw-black` | `800` |

**Line height**
| 토큰 | 값 |
|---|---|
| `--lh-tight` | `1.35` |
| `--lh-body` | `1.6` |
| `--lh-relaxed` | `1.75` |

**Letter spacing**
| 토큰 | 값 |
|---|---|
| `--ls-tight` | `-0.02em` |
| `--ls-wide` | `0.02em` |

### Layout
| 토큰 | 값 |
|---|---|
| `--nav-h` | `60px` |
| `--sidebar-w` | `240px` |
| `--content-max` | `1200px` |

### Motion
| 토큰 | 값 |
|---|---|
| `--dur-fast` | `0.12s` |
| `--dur-base` | `0.15s` |
| `--dur-slow` | `0.18s` |
| `--ease` | `ease` |

### IDE 전용 (식별만 — 처리 방침은 § 4)

> 출처: `prototype/ide-theme.css`. tokens.css 에 그대로 합칠지, 별도 파일로 분리할지는 § 4 에서 결정.

**Terminal accent**
| 토큰 | 값 |
|---|---|
| `--term-green` | `#00FF88` |
| `--term-green-dim` | `#00CC6A` |
| `--term-green-soft` | `rgba(0, 255, 136, 0.12)` |

**Syntax highlighting (light)**
| 토큰 | 값 | 용도 |
|---|---|---|
| `--syn-keyword` | `#7C3AED` | const, function, import |
| `--syn-string` | `#0F9D58` | "strings" |
| `--syn-number` | `#D97706` | 49000, 1.2.0 |
| `--syn-fn` | `#2563EB` | function names |
| `--syn-prop` | `#0891B2` | object properties |
| `--syn-comment` | `#64748B` | // comments |
| `--syn-punct` | `#475569` | brackets, commas |
| `--syn-type` | `#BE185D` | TS types |
| `--syn-tag` | `#DC2626` | JSX tags |

**IDE chrome**
| 토큰 | 값 | 용도 |
|---|---|---|
| `--chrome` | `#F3F4F6` | title bar, tabs bg |
| `--chrome-2` | `#E5E7EB` | divider, inactive tab |
| `--gutter` | `#F8FAFC` | line-number gutter |
| `--gutter-text` | `#94A3B8` | line-number color |
| `--editor-bg` | `#FFFFFF` | editor surface |
| `--editor-line` | `rgba(79, 70, 229, 0.04)` | current-line highlight |
| `--sidebar-bg` | `#FAFBFC` | explorer sidebar |
| `--status-bg` | `#4F46E5` | bottom status bar |
| `--status-text` | `#FFFFFF` | status bar text |
| `--minimap-bg` | `#F8FAFC` | minimap surface |

## 2. src/styles-v2/global.css 에 들어갈 글로벌

전제: `global.css` 는 `tokens.css` import 후에 로드. 모든 v2 페이지에 무조건 적용되는 "기본값"만 담는다.
IDE 전용(폭주 모노스페이스, `overflow: hidden` 바디 락 등)은 § 4 의 IDE 레이아웃 스코프로 분리.

### 2-1. 폰트 import (파일 최상단)

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
```

> 출처: `prototype/tokens.css:7`. v2 에서도 동일하게 `global.css` 1줄째에 둠.
> tokens.css 가 아닌 global.css 에 두는 이유: `@import` 는 항상 파일 최상단이어야 하고, tokens.css 는 변수만 모아두는 깨끗한 파일로 유지하고 싶기 때문. (§ 6 파일 생성 순서에서 재확인)

### 2-2. 기본 리셋

기존 `src/styles/globals.css:1-5` 의 리셋과 `prototype/ide-theme.css:79` 의 리셋이 사실상 동일. v2 에서도 그대로.

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

ul, ol { list-style: none; }            /* prototype/ide-theme.css:95 */
img    { max-width: 100%; display: block; } /* 기존 globals.css:91 */
a      { color: inherit; text-decoration: none; }
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}
input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  outline: none;
}
```

> `font-family: inherit` 로 둬서 body 의 `var(--font)` 가 자연스럽게 흘러내려가도록. 기존 `globals.css` 는 `var(--font)` 를 다시 박아뒀는데 v2 에서는 IDE 페이지가 `font-mono` 로 갈아탈 수 있어야 하므로 `inherit` 가 더 유연함.

### 2-3. html / body 기본

```css
html { font-size: 16px; }

body {
  font-family: var(--font);
  font-size: var(--fs-base);          /* 14px */
  line-height: var(--lh-body);        /* 1.6 */
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'cv11', 'ss01', 'ss03';  /* Geist 권장 OT 피처 (옵션) */
}
```

> `overflow: hidden` 은 body 에 절대 걸지 않음. (`prototype/ide-theme.css:89` 가 거는 건 IDE 셸 전용이므로 § 4)
> Geist 폰트는 OpenType 피처(`cv11`, `ss01` 등)로 디테일이 변하는데, 프로토타입에는 명시 안 돼있음 → v2 도입 여부는 시각 검수 후 결정 (일단 옵션으로 표기, 도입 시 PR 에서 확정).

### 2-4. ::selection

```css
::selection {
  background: var(--brand-light);
  color: var(--brand);
}
```

> 출처: 프로토타입에는 명시 없음. v2 신규 추가. 브랜드 컬러 일관성 확보.

### 2-5. 스크롤바 (전역, IDE 외 페이지용)

```css
::-webkit-scrollbar       { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }
```

> 출처: 기존 `globals.css:93-96` 그대로. (IDE 셸용 10px 두꺼운 스크롤바는 `prototype/ide-theme.css:635-645` 에 `.ide-editor::-webkit-scrollbar` 로 스코프돼 있음 → § 4 에서 IDE 컴포넌트 전용으로 유지)

### 2-6. 글로벌 유틸리티 (최소)

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

> `.sr-only` 는 기존 `globals.css:99-108` 그대로 유지 (접근성).
> `.truncate` 는 기존 `globals.css:110` + `prototype/ide-theme.css:747` 양쪽에 동일 정의 — 글로벌로 1번만.
> `.mono` / `.sans` 같은 IDE 유틸(`ide-theme.css:760-761`)은 IDE 페이지에서만 쓰이므로 글로벌에 두지 않음 → § 4.

### 2-7. @keyframes (글로벌 공유)

프로토타입에서 인라인 `<style>` 로 박혀있는 키프레임을 v2 에서는 글로벌로 끌어올린다 (CLAUDE.md "프로토타입의 인라인 style 은 가져오지 않음" 규칙 대응).

| 키프레임 | 정의 | 출처 (프로토타입) | v2 사용처 |
|---|---|---|---|
| `spin` | `to { transform: rotate(360deg); }` | `Login.jsx:69` (인라인) + 기존 `globals.css:333` | 로딩 스피너 (모든 페이지) |
| `blink` | `50% { opacity: 0; }` | `Landing.jsx:72` (인라인) | 터미널 풍 커서 (Landing/IDE 톤 컴포넌트) |
| `slideUp` | (기존 `globals.css:366` 참고) | 기존 globals.css | 토스트/모달 진입 (재사용 시) |

> `caret-blink` (`prototype/ide-theme.css:371`) 는 IDE 에디터의 캐럿 전용 → § 4 에서 IDE 스코프로 유지. 글로벌에 올리지 않음.

### 2-8. 다크모드 컬러 스킴 힌트

```css
:root             { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }   /* 변수 오버라이드는 tokens.css 쪽, 여기는 브라우저 힌트만 */
```

> 출처: `prototype/tokens.css:119` 의 `color-scheme: dark` 한 줄을 분리해 글로벌로. 이렇게 하면 브라우저 기본 폼 컨트롤/스크롤바 색이 자동 전환됨. (변수 오버라이드 자체는 tokens.css — § 5 에서 다룸)

### 2-9. global.css 에 **들어가지 않는** 항목 (체크리스트)

- ❌ `body { overflow: hidden }` — IDE 셸 전용 (§ 4)
- ❌ `body { font-family: var(--font-mono) }` — IDE 셸 전용 (§ 4)
- ❌ `.ide-*`, `.tab`, `.gutter`, `.editor-*`, `.json-card`, `.terminal`, `.palette*`, `.stack-trace`, `.code-input`, `.chip`, `.btn-term`, `.flat-card`, `.form-row`, `.status-chip`, `.mini-line`, `.act-btn`, `.side-*`, `.term-*`, `.kbd`, `.mono`, `.sans` — IDE 컴포넌트 클래스 (§ 4)
- ❌ `.ds-display`, `.ds-h1` … `.ds-eyebrow` — 시맨틱 타이포 클래스 (`prototype/tokens.css:134-213`). 이건 v2 컴포넌트가 직접 쓸지, 모듈 CSS 로 흡수할지 결정 필요 → § 6 (파일 순서) 에서 다시 판단
- ❌ 페이지별 레이아웃 (`.ide` grid 정의 등) — 페이지/컴포넌트 CSS 로

## 3. 기존 토큰과 충돌 / alias 필요 항목

### 3-0. 기존 토큰 위치

기존 프로젝트는 **CSS 토큰 파일이 별도로 존재하지 않음**. (INVENTORY.md § 5 — "CSS 라이브러리 의존성 없음. 순수 CSS 한 파일")

- 단일 파일: `src/styles/globals.css` (494 LOC)
- 구조: 리셋 → `:root` 토큰 (lines 7-64) → 컴포넌트 클래스 (`.btn`, `.card`, `.form-*` 등) → `[data-theme="dark"]` 컴포넌트 단위 오버라이드 (lines 443-494)
- ThemeContext.tsx 가 일부 변수를 JS 로 직접 주입 (`prototype/tokens.css:3` 주석 참고)
- v2 작업 중 **`src/styles/globals.css` 는 cutover PR 전까지 수정 금지** (CLAUDE.md 절대 규칙)
- 따라서 v2 토큰 파일은 `src/styles-v2/tokens.css` 로 **신규 추가**, 기존 globals.css 는 cutover 시 일괄 폐기 대상

### 3-1. 토큰 이름 충돌 분석

기존 `globals.css:7-64` 와 `prototype/tokens.css:9-115` 비교 결과:

> **결론: 이름·값 모두 동일하거나 신규 추가만 있음. 충돌(같은 이름·다른 값) 0건.**
> 즉 v2 tokens.css 가 기존 globals.css 와 같은 페이지에 동시 로드돼도 변수 충돌은 없음 (마지막 선언이 이김 → 동일 값이라 무시 가능).

| 기존 토큰 | 신규 토큰 | 처리 방침 | 비고 |
|---|---|---|---|
| `--brand` `#4F46E5` | `--brand` `#4F46E5` | 유지 | 동일 |
| `--brand-hover` `#4338CA` | `--brand-hover` `#4338CA` | 유지 | 동일 |
| `--brand-light` `#EEF2FF` | `--brand-light` `#EEF2FF` | 유지 | 동일 |
| `--brand-muted` `#818CF8` | `--brand-muted` `#818CF8` | 유지 | 동일 |
| `--bg` `#F8FAFC` | `--bg` `#F8FAFC` | 유지 | 동일 |
| `--surface` / `-2` / `-3` | 동일 | 유지 | 동일 |
| `--text` / `-2` / `-3` / `-4` | 동일 | 유지 | 동일 |
| `--border` / `-2` | 동일 | 유지 | 동일 |
| `--success` / `-bg` / `-text` | 동일 | 유지 | 동일 |
| `--warning` / `-bg` / `-text` | 동일 | 유지 | 동일 |
| `--danger` / `-bg` / `-text` | 동일 | 유지 | 동일 |
| `--info` / `-bg` / `-text` | 동일 | 유지 | 동일 |
| `--r-sm` / `md` / `lg` / `xl` / `full` | 동일 | 유지 | 동일 |
| `--shadow-sm` / `md` / `lg` | 동일 | 유지 | 동일 |
| `--font` / `--font-mono` | 동일 | 유지 | 동일 |
| `--nav-h` `60px` / `--sidebar-w` `240px` / `--content-max` `1200px` | 동일 | 유지 | 동일 |

### 3-2. 기존 토큰 미존재 → 신규 추가 (alias 불필요, 충돌 없음)

기존 globals.css 에는 **없고** 프로토타입에만 있는 토큰. v2 가 새로 들여오는 항목.

| 카테고리 | 신규 토큰 | 처리 방침 | 비고 |
|---|---|---|---|
| Accent | `--accent-indigo` / `-sky` / `-emerald` / `-amber` / `-violet` / `-pink` / `-red` | 신규 추가 | 이벤트 카드 회전 팔레트. 기존엔 색상 7종을 인라인 사용 중 |
| Shadow | `--shadow-card-hover` `0 12px 32px rgba(0,0,0,0.12)` | 신규 추가 | 기존엔 카드 호버 박스섀도 정의 없음 |
| Shadow | `--shadow-modal` `0 20px 60px rgba(0,0,0,0.2)` | 신규 추가 | 기존엔 모달 정의 자체가 없음 |
| Type scale | `--fs-display` … `--fs-3xs` (11종) | 신규 추가 | 기존은 컴포넌트마다 `font-size` 하드코딩 |
| Weights | `--fw-regular` … `--fw-black` (5종) | 신규 추가 | 기존은 `font-weight: 500` 등 하드코딩 |
| Line height | `--lh-tight` / `body` / `relaxed` | 신규 추가 | 기존 body 의 `line-height: 1.6` 만 존재 (하드코딩) |
| Letter spacing | `--ls-tight` / `wide` | 신규 추가 | 기존엔 letter-spacing 토큰 없음 |
| Motion | `--dur-fast` / `base` / `slow` / `--ease` | 신규 추가 | 기존은 `transition: all 0.15s` 등 하드코딩 |
| IDE 전용 | `--term-green*`, `--syn-*`, `--chrome*`, `--gutter*`, `--editor-*`, `--sidebar-bg`, `--status-bg/text`, `--minimap-bg` | 신규 추가 (스코프 결정 보류 → § 4) | 기존엔 전무 |

### 3-3. alias 필요 여부

> **결론: alias 없음.**
> 기존 코드(`src/components/`, `src/pages/`)는 모두 `--brand`, `--surface` 같은 동일 이름을 그대로 쓰고 있고 v2 토큰도 같은 이름이므로, 호환 alias(`--primary: var(--brand)` 등)를 만들 필요가 없음. 기존 컴포넌트 코드는 cutover 전까지 손대지 않으므로 호환성 이슈 자체가 발생하지 않음.

| 후보 | 판단 | 근거 |
|---|---|---|
| `--primary` → `var(--brand)` | ❌ 불필요 | 기존 코드에 `--primary` 사용처 없음 |
| `--text-primary` → `var(--text)` | ❌ 불필요 | 기존 코드는 `--text` 직접 사용 |
| `--radius-md` → `var(--r-md)` | ❌ 불필요 | 기존 코드는 `--r-md` 직접 사용 |

### 3-4. 폐기 권고 (cutover 시점에 처리)

기존 `globals.css` 의 다음 항목들은 v2 토큰/컴포넌트 도입 후 **cutover PR 에서 globals.css 를 통째로 제거**하면 자연스럽게 사라짐. 사전에 따로 폐기할 필요 없음.

| 기존 위치 | 항목 | 대체 |
|---|---|---|
| `globals.css:1-5` | 리셋 | v2 `global.css` (§ 2-2) |
| `globals.css:7-64` | `:root` 토큰 | v2 `tokens.css` (§ 1) |
| `globals.css:66-91` | html/body/a/button/input 기본 | v2 `global.css` (§ 2-3) |
| `globals.css:93-114` | 스크롤바, `.sr-only`, `.truncate` | v2 `global.css` (§ 2-5, 2-6) |
| `globals.css:116-441` | 컴포넌트 클래스 (`.btn`, `.card`, `.form-*`, `.table`, `.tabs`, `.empty-state`, `.spinner`, `.toast`, `.pagination`, `.stat-card`, `.search-*` 등) | v2 컴포넌트별 CSS / `prototype/ide-theme.css` 의 클래스 (§ 4) |
| `globals.css:443-494` | `[data-theme="dark"]` 컴포넌트 단위 오버라이드 | v2 는 변수 단위 오버라이드로 전환 (§ 5) |

### 3-5. 하드코딩 → v2 에서 토큰화될 값 (참고)

표에 넣은 "신규 추가" 와 별개로, 기존 globals.css 에서 **리터럴로 박혀있는데 v2 토큰으로 회수 가능**한 값들. 컴포넌트 재구현 시 주의.

| 위치 | 하드코딩 값 | 회수할 토큰 |
|---|---|---|
| `globals.css:72` body | `line-height: 1.6` | `var(--lh-body)` |
| `globals.css:87` input | `font-size: 14px` | `var(--fs-base)` |
| `globals.css:146` `.btn` | `transition: all 0.15s` | `var(--dur-base)` + `var(--ease)` |
| `globals.css:167` `.btn-danger` | `border: 1px solid #FECACA` | semantic 확장 검토 (`--danger-border` 신설 후보) |
| `globals.css:169` `.btn-danger:hover` | `background: #FEE2E2` | semantic 확장 검토 |
| `globals.css:230` `.form-input:focus` | `box-shadow: 0 0 0 3px rgb(79 70 229 / 0.1)` | `--shadow-focus` 신규 토큰 신설 후보 (또는 `var(--brand-light)` 활용) |
| `globals.css:493` 다크 header | `rgba(15, 23, 42, 0.92)` | 다크 변수 정리 시 `--surface-overlay` 류로 회수 (§ 5) |

> 위 항목은 § 1 토큰 표에는 아직 안 들어간 "후보". 실제 추가 여부는 v2 컴포넌트 PR 단위에서 합의.

## 4. IDE 전용 토큰 처리 방침

### 4-0. 식별: IDE 전용 토큰 22개

`prototype/ide-theme.css:8-36` 에서 정의된 토큰. 다크 오버라이드(`:38-76`)는 같은 토큰의 다른 값이라 토큰 수에 포함하지 않음.

| 그룹 | 토큰 | 사용처 (프로토타입) |
|---|---|---|
| **Terminal accent** (3) | `--term-green`, `--term-green-dim`, `--term-green-soft` | Landing TypedTerminal, 터미널 블록, status bar `.term-ok`, code-input prompt, btn-term, status-chip.free |
| **Syntax** (9) | `--syn-keyword`, `--syn-string`, `--syn-number`, `--syn-fn`, `--syn-prop`, `--syn-comment`, `--syn-punct`, `--syn-type`, `--syn-tag` | 에디터 본문(`.sk/.ss/.sn/...`), JSON 카드 헤더/필드, 미니맵 라인, stack-trace, form-row label |
| **Chrome** (2) | `--chrome`, `--chrome-2` | 타이틀바, 탭바, JSON 카드 헤더, command palette hint |
| **Gutter** (2) | `--gutter`, `--gutter-text` | 라인 번호 거터 |
| **Editor** (2) | `--editor-bg`, `--editor-line` | 에디터 본문 배경, 활성 라인/사이드 active 하이라이트 |
| **Sidebar** (1) | `--sidebar-bg` | IDE 좌측 활동바 + 파일 트리 |
| **Status bar** (2) | `--status-bg`, `--status-text` | 하단 상태바 |
| **Minimap** (1) | `--minimap-bg` | 우측 미니맵 |

### 4-1. 결정 기준 (SPEC 정합성)

`docs/redesign/Spec.md:319-328` § 8 토큰 머지 가이드는 다음을 못박음:

> **"신규 추가: IDE 전용 토큰 (--editor-bg, --chrome, --gutter, --term-green 등). 신규 토큰 위치: `src/styles-v2/tokens.css`. 컴포넌트 안에 박지 말 것."**

따라서 두 시나리오 공통으로:
- ❌ **Layout 컴포넌트 안에 `style={{...}}` 또는 컴포넌트 모듈 CSS 의 `:where(.layout)` 스코프로 두는 안 — 채택 불가** (SPEC § 8 위반)
- ✅ tokens.css(또는 그에 준하는 별도 토큰 파일)에 `:root` 레벨로 정의

남은 결정 축은 **"단일 tokens.css 인가, 분리 ide-tokens.css 인가"** 하나뿐.

### 4-2. 시나리오 A — IDE 충실 재현 (SPEC § 7 기본값)

전제: Layout chrome 이 사이드바/탭/거터/미니맵/상태바를 모두 갖춤. 22개 토큰이 **거의 다 활발히 사용**됨.

**방침: 단일 `src/styles-v2/tokens.css` 에 모두 포함.**

```
src/styles-v2/
├── tokens.css         # 공통 토큰 + IDE 전용 토큰 (22개) + 다크 오버라이드
└── global.css         # 리셋 / body / 키프레임
```

| 항목 | 처리 |
|---|---|
| 라이트 토큰 22종 | tokens.css 의 `:root` 블록 내 `/* === IDE === */` 섹션으로 묶어 추가 |
| 다크 오버라이드 22종 | tokens.css 의 `[data-theme="dark"]` 블록에 합류 (§ 5) |
| 컴포넌트 클래스 (`.ide-*`, `.tab`, `.gutter`, `.json-card`, `.terminal`, `.palette*`, `.stack-trace`, `.code-input`, `.chip`, `.btn-term`, `.flat-card`, `.form-row`, `.status-chip`, `.act-*`, `.side-*`, `.term-*`, `.kbd`, `.mono`, `.sans`) | **토큰이 아니라 클래스이므로** tokens.css 가 아닌 Layout 컴포넌트의 CSS Module 또는 `src/styles-v2/components/ide-chrome.css` 로 분리. § 6 에서 확정 |

**장점**
- SPEC § 8 의 "단일 위치" 원칙과 100% 정합
- 변수 lookup 위치가 한 군데 — 디버깅 단순
- 다크 오버라이드를 한 블록에서 관리 가능 (§ 5)

**단점**
- IDE 외 페이지에서 안 쓰이는 변수(`--minimap-bg`, `--syn-tag` 등)도 항상 평가됨. 단 CSS 변수는 lazy 평가라 런타임 비용 사실상 0.

### 4-3. 시나리오 B — 컨셉만 차용

전제: gutter / mono 폰트 / 상태바 정도만 chrome 으로 가져가고, 사이드바·탭·미니맵·문법 하이라이팅은 사용 안 함. 22개 중 실사용은 **약 6~8개**로 축소.

**권고 방침: 그래도 단일 `tokens.css` 를 유지 (B-1). 단, 페이지 톤 디자인이 IDE 어휘와 명확히 분리된다고 팀이 판단하면 B-2 (분리) 채택 가능.**

#### B-1. 단일 tokens.css 유지 (SPEC § 8 정합)

| 토큰 | 옵션 B 사용처 | 처리 |
|---|---|---|
| `--term-green*` (3) | Landing TypedTerminal, 결제 성공/티켓 OK 인디케이터 | tokens.css |
| `--gutter`, `--gutter-text` (2) | 본문 영역 라인 번호 띠 | tokens.css |
| `--status-bg`, `--status-text` (2) | 하단 상태바 | tokens.css |
| `--editor-bg`, `--editor-line` (2) | 본문 배경 / 활성 라인 hover (옵션) | tokens.css (안 쓰면 dead 변수, 비용 0) |
| 나머지 13개 (`--chrome*`, `--sidebar-bg`, `--minimap-bg`, `--syn-*`) | 사용처 없음 | tokens.css 에 그대로 두되 주석으로 "옵션 B 미사용" 표기, 또는 아예 제외 |

→ 13개를 제외하기로 결정하면 § 1 의 IDE 전용 표에서도 빼야 함. **합의 시점에 § 1 동기화 필요.**

#### B-2. 분리 파일 `src/styles-v2/ide-tokens.css` (SPEC § 8 부분 deviation)

```
src/styles-v2/
├── tokens.css         # 공통 토큰만 (Brand/Surface/Text/.../Motion)
├── ide-tokens.css     # IDE 전용 토큰 22개 + 그 다크 오버라이드
└── global.css         # 리셋 / body / 키프레임
```

- `ide-tokens.css` 는 **앱 진입점에서 무조건 같이 import** (tokens.css 직후) — 컴포넌트 단위 import 가 아님. 이 점이 "컴포넌트 안에 박지 말 것" 규칙을 우회하지 않음을 보장.
- SPEC § 8 의 문구상 "위치: tokens.css" 와 충돌하므로 **B-2 채택 시 SPEC § 8 갱신 PR 동반 필요**.

| 장점 | 단점 |
|---|---|
| tokens.css 가 도메인 토큰만 깨끗하게 유지 | 변수 위치가 두 파일로 갈라짐 — 신규 합류자 학습 비용 |
| IDE 컨셉 폐기 시 ide-tokens.css 만 제거하면 됨 | SPEC § 8 갱신 필요 |
| 다른 테마(예: 미니멀) 추가 시 파일 단위 swap 가능 | 다크 오버라이드 위치도 두 파일로 분산 (§ 5 영향) |

### 4-4. 결정 매트릭스

| Layout chrome 결정 | tokens 처리 권고 | SPEC 갱신 필요? |
|---|---|---|
| **A** (충실 재현, SPEC 기본값) | **시나리오 A: 단일 tokens.css 에 22개 모두 포함** | ❌ 불필요 |
| **B** (컨셉만) + 변수 정리 OK | **B-1: 단일 tokens.css 유지, 미사용 13개 제거 또는 주석** | § 1 동기화만 |
| **B** (컨셉만) + 파일 분리 선호 | B-2: `ide-tokens.css` 분리 | ✅ § 8 갱신 PR 동반 |

### 4-5. 현 시점 액션

- SPEC § 7 의 기본 가정이 **A** 이므로, 다른 결정이 없으면 **시나리오 A 로 진행**.
- Layout chrome 작업 PR (Phase 0 첫 PR) 에서 A/B 가 확정될 때까지 § 1 의 "IDE 전용" 블록은 22개 모두 유지.
- B 로 뒤집힐 경우 § 1 와 § 5 의 IDE 토큰 부분, 그리고 (B-2 라면) SPEC § 8 도 동반 갱신.

## 5. 다크모드 `[data-theme="dark"]` 스코프

### 5-0. 현재 메커니즘 (기존 코드 분석)

`src/contexts/ThemeContext.tsx` 가 이미 존재하고 **거의 완성**되어 있음. 단, CSS 변수 주입 방식이 v2 방향과 어긋남.

| 항목 | 기존 동작 | 위치 |
|---|---|---|
| 3-state 테마 | `'light' | 'dark' | 'system'` | `ThemeContext.tsx:3` |
| localStorage 키 | `'devticket-theme'` | `ThemeContext.tsx:14` |
| 시스템 감지 | `window.matchMedia('(prefers-color-scheme: dark)')` | `ThemeContext.tsx:17` |
| 시스템 변경 listener | OS 테마 바뀌면 자동 반영 (system 모드일 때만) | `ThemeContext.tsx:65-71` |
| `data-theme` 속성 토글 | `<html data-theme="dark">` set | `ThemeContext.tsx:22` |
| **CSS 변수 주입** | **JS 가 `root.style.setProperty(...)` 로 11개 변수 직접 주입** | `ThemeContext.tsx:25-49` |

**문제점**: CSS 변수 오버라이드가 JS 코드에 박혀 있어서, 토큰을 추가/수정할 때마다 ThemeContext.tsx 도 같이 손봐야 함. 변수 정의가 CSS 와 JS 두 군데로 갈라짐.

### 5-1. v2 방침: JS setProperty 폐기 → CSS `[data-theme="dark"]` 셀렉터로 일원화

```css
/* src/styles-v2/tokens.css */
:root {
  --bg: #F8FAFC;
  /* ... 라이트 값 ... */
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0F172A;
  /* ... 모든 다크 오버라이드 ... */
}
```

**ThemeContext.tsx 변경 사항** (재사용하되 setProperty 로직만 제거):

| 라인 | 처리 |
|---|---|
| `ThemeContext.tsx:22` `root.setAttribute('data-theme', resolved)` | **유지** — CSS 셀렉터가 잡을 hook |
| `ThemeContext.tsx:25-49` `if (resolved === 'dark') { root.style.setProperty(...) } else { removeProperty(...) }` | **삭제** — CSS 가 대신 처리 |
| 그 외 (state, localStorage, system 감지, 토글) | **유지** — 그대로 재사용 |

> v2 절대 규칙(`docs/CLAUDE.md`): 기존 `src/contexts/`, `src/api/`, `src/hooks/` 같은 비페이지 비컴포넌트 레이어는 cutover 전까지 수정 금지가 아님 (금지 대상은 `src/pages/`, `src/components/`). ThemeContext 는 v2 페이지가 같이 쓰는 컨텍스트이므로 **인플레이스 수정 가능**. 단 cutover 전까지 기존 페이지가 라이트 모드만 정상 동작하면 되는데, JS setProperty 를 제거해도 CSS 셀렉터가 같은 변수를 정의하므로 기존 페이지에도 그대로 동작 (오히려 일관성 향상).
> 만약 cutover 전 인플레이스 수정에 부담이 있다면 `src/contexts-v2/ThemeContext.tsx` 를 신규로 두고, cutover 시 교체하는 안도 가능 — Layout 작업 PR 에서 결정.

### 5-2. 오버라이드 토큰 목록 — 공통 토큰 (`prototype/tokens.css:117-131` 그대로)

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--bg` | `#F8FAFC` | `#0F172A` |
| `--surface` | `#FFFFFF` | `#1E293B` |
| `--surface-2` | `#F1F5F9` | `#263047` |
| `--surface-3` | `#E2E8F0` | `#334155` |
| `--text` | `#0F172A` | `#F1F5F9` |
| `--text-2` | `#334155` | `#CBD5E1` |
| `--text-3` | `#64748B` | `#94A3B8` |
| `--text-4` | `#94A3B8` | `#64748B` |
| `--border` | `#E2E8F0` | `#1E293B` |
| `--border-2` | `#CBD5E1` | `#334155` |
| `--brand-light` | `#EEF2FF` | `rgba(79, 70, 229, 0.20)` |
| `color-scheme` | `light` (`:root`) | `dark` |

**채택 결정**: 11개 모두 그대로 채택. 기존 ThemeContext.tsx:26-36 의 값과 정확히 일치하므로 회귀 위험 없음.

### 5-3. 오버라이드 토큰 목록 — IDE 전용 (`prototype/ide-theme.css:38-76`)

§ 4 시나리오 A (단일 tokens.css 통합) 채택 시 같은 `[data-theme="dark"]` 블록에 합류.

**Terminal accent**
| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--term-green` | `#00FF88` | `#00FF88` (동일) |
| `--term-green-dim` | `#00CC6A` | `#00E07A` |
| `--term-green-soft` | `rgba(0,255,136,0.12)` | `rgba(0,255,136,0.14)` |

**Syntax (VS Code Dark+ 톤)**
| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--syn-keyword` | `#7C3AED` | `#C586C0` |
| `--syn-string` | `#0F9D58` | `#CE9178` |
| `--syn-number` | `#D97706` | `#B5CEA8` |
| `--syn-fn` | `#2563EB` | `#DCDCAA` |
| `--syn-prop` | `#0891B2` | `#9CDCFE` |
| `--syn-comment` | `#64748B` | `#6B7280` |
| `--syn-punct` | `#475569` | `#94A3B8` |
| `--syn-type` | `#BE185D` | `#4EC9B0` |
| `--syn-tag` | `#DC2626` | `#569CD6` |

**IDE chrome**
| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--chrome` | `#F3F4F6` | `#252526` |
| `--chrome-2` | `#E5E7EB` | `#333333` |
| `--gutter` | `#F8FAFC` | `#1E1E1E` |
| `--gutter-text` | `#94A3B8` | `#5A6270` |
| `--editor-bg` | `#FFFFFF` | `#1E1E1E` |
| `--editor-line` | `rgba(79,70,229,0.04)` | `rgba(255,255,255,0.035)` |
| `--sidebar-bg` | `#FAFBFC` | `#1A1A1C` |
| `--status-bg` | `#4F46E5` | `#007ACC` |
| `--status-text` | `#FFFFFF` | `#FFFFFF` |
| `--minimap-bg` | `#F8FAFC` | `#161618` |

### 5-4. ⚠️ 결정 필요: IDE 다크에서 공통 surface/text/border 재오버라이드 충돌

`prototype/ide-theme.css:65-75` 가 다크 모드에서 **공통 토큰을 한 번 더** 오버라이드한다. 값은 § 5-2 와 다름.

| 토큰 | tokens.css 다크 (5-2) | ide-theme.css 다크 (재오버라이드) | 톤 |
|---|---|---|---|
| `--bg` | `#0F172A` (slate-900) | `#1E1E1E` (VS Code) | IDE 가 더 어둡고 중성 |
| `--surface` | `#1E293B` | `#252526` | IDE 가 더 어둡고 중성 |
| `--surface-2` | `#263047` | `#2D2D30` | 〃 |
| `--surface-3` | `#334155` | `#3E3E42` | 〃 |
| `--text` | `#F1F5F9` | `#D4D4D4` | IDE 가 덜 밝음 |
| `--text-2` | `#CBD5E1` | `#B8B8B8` | 〃 |
| `--text-3` | `#94A3B8` | `#858585` | 〃 |
| `--text-4` | `#64748B` | `#6A6A6A` | 〃 |
| `--border` | `#1E293B` | `#3E3E42` | IDE 가 더 밝은 회색 |
| `--border-2` | `#334155` | `#505050` | 〃 |

**§ 4 에서 시나리오 A 로 단일 파일 통합을 결정했으므로, 같은 변수를 두 번 정의할 수 없음.** Layout 작업 PR 에서 다음 중 택 1:

| 옵션 | 결과 | 영향 |
|---|---|---|
| **5-4-a** Slate 톤 채택 (tokens.css 다크 그대로) | IDE 셸도 slate 계열로 통일. VS Code 느낌은 약해짐 | 기존 ThemeContext 의 11개 값과 일치 — 회귀 0 |
| **5-4-b** VS Code Dark+ 톤 채택 (ide-theme.css 값으로) | 비IDE 페이지(MyPage, Cart, EventDetail …)도 다크모드에서 VS Code 톤이 됨 — 시각 일관성↑ | 기존 ThemeContext 와 값이 달라짐. 기존 페이지의 다크 스크린샷과 차이. 기존 페이지가 cutover 전이라도 다크에서 톤 변함 |
| **5-4-c** IDE 셸용 토큰을 별도로 도입 (`--ide-bg`, `--ide-surface` …) | 두 톤을 공존시킴 | 토큰 수↑, IDE 컴포넌트가 별도 변수 사용 — § 1 와 § 4 도 동기화 필요 |

> **권고: 5-4-a (slate 톤 채택)**. 근거 — (1) 기존 ThemeContext 와 값이 같아 회귀 0, (2) SPEC § 8 의 "단일 위치" 원칙과 가장 잘 맞음, (3) IDE 셸의 슬레이트 톤은 시각상 충분히 어둡고 브랜드 indigo 와도 잘 맞음. **5-4-b 를 원하면 기존 페이지의 다크 회귀 검수 PR 동반 필수.**

### 5-5. `prefers-color-scheme` 자동 감지

| 항목 | 결정 |
|---|---|
| 도입 여부 | ✅ 도입 (이미 기존 ThemeContext 에 구현됨) |
| 기본 모드 | `'system'` (`ThemeContext.tsx:54`) — OS 설정 따라감 |
| OS 테마 변경 listener | 유지 (`ThemeContext.tsx:65-71`) |
| 사용자 명시 선택 | localStorage `devticket-theme` 에 `'light'` / `'dark'` 저장 — system 우선순위 위 |

> CSS 측에서 `@media (prefers-color-scheme: dark)` 미디어 쿼리는 **사용하지 않음**. 이유: 사용자가 명시 선택한 경우 OS 와 어긋날 수 있는데, 미디어 쿼리는 그걸 못 잡음. `data-theme` 속성 단일 source 로 가는 게 깔끔.

### 5-6. 토글 메커니즘

기존 코드 그대로 재활용:

| API | 위치 | 비고 |
|---|---|---|
| `useTheme()` 훅 | `ThemeContext.tsx:89` | 기존 그대로 |
| `setTheme('light' | 'dark' | 'system')` | `ThemeContext.tsx:73` | 기존 그대로 |
| `toggleTheme()` (light↔dark 2-state 토글) | `ThemeContext.tsx:78` | 기존 그대로. status bar 의 테마 토글 버튼이 호출 |
| `resolvedTheme` (현재 적용된 'light' | 'dark') | `ThemeContext.tsx:7` | 기존 그대로 |

> 신규 토글 컴포넌트 (status bar 우측 등) 는 `src/components-v2/` 에 새로 만들고 `useTheme()` 만 호출.

### 5-7. 다크 전용 컴포넌트 스타일 (참고)

§ 5 는 **토큰 오버라이드만** 다룸. 컴포넌트 단위 다크 스타일(예: `[data-theme="dark"] .terminal { background: #0D1117 }`, `prototype/ide-theme.css:437`)은 § 4 에서 IDE 컴포넌트 CSS 와 함께 처리.

기존 `src/styles/globals.css:443-494` 의 컴포넌트 단위 다크 오버라이드(`.card`, `.form-input`, `.btn-secondary`, `th`, `tr:hover td`, `.toast`, `header`)는 **변수만 제대로 다크에 매핑되면 자동으로 처리되므로 v2 컴포넌트에서는 거의 불필요**해질 전망. 단 기존 globals.css 자체는 § 3-4 대로 cutover 시 일괄 폐기.

## 6. 파일 생성 순서 (구현 시 참고)

§ 1 ~ § 5 결론(특히 § 4 시나리오 **A**, § 5-4 옵션 **a** 권고)을 전제로 한 순서. 각 단계는 **하나의 commit**, 전체는 **하나의 PR (Phase 0 첫 PR)** 로 묶기를 권장.

### Phase 0 첫 PR — "v2 토큰/글로벌 도입"

#### 1️⃣ `src/styles-v2/tokens.css` (신규)

| 항목 | 값 |
|---|---|
| 의존성 | 없음 (가장 먼저) |
| 내용 | § 1 의 모든 공통 토큰 + § 4 시나리오 A 의 IDE 전용 22개 + § 5-2/5-3 의 다크 오버라이드 |
| 토큰 수 (라이트) | 약 95개 — Brand 4 + Surfaces 4 + Text 4 + Borders 2 + Semantic 12 + Accent 7 + Radius 5 + Elevation 5 + Typography 23 (font 2 + scale 11 + weight 5 + lh 3 + ls 2) + Layout 3 + Motion 4 + IDE 22 |
| 토큰 수 (다크 오버라이드) | 33개 — 공통 11 + IDE 22 (5-4-a 채택 시 surface/text/border 재오버라이드 없음) |
| 추정 LOC | **약 200~250줄** (섹션 주석 포함) |
| 구조 | `:root { /* 섹션별 주석 + 변수 */ }` → `[data-theme="dark"] { color-scheme:dark; /* 33개 오버라이드 */ }` |
| Commit 메시지 | `style(v2): add tokens.css with all design tokens (light + dark)` |

#### 2️⃣ `src/styles-v2/global.css` (신규)

| 항목 | 값 |
|---|---|
| 의존성 | ① tokens.css (변수 참조) |
| 내용 | § 2 그대로 |
| 추정 LOC | **약 80~100줄** — 폰트 import 1 + 리셋 10 + html/body 15 + ::selection 4 + 스크롤바 3 + 유틸(.sr-only, .truncate) 15 + @keyframes(spin, blink, slideUp) 10 + color-scheme 힌트 2 + 섹션 주석 |
| Commit 메시지 | `style(v2): add global.css (reset, body, scrollbar, keyframes)` |

#### 3️⃣ `src/main.tsx` (수정)

| 항목 | 값 |
|---|---|
| 의존성 | ①, ② |
| 변경 | 기존 `import './styles/globals.css'` 위에 `import './styles-v2/tokens.css'` + `import './styles-v2/global.css'` 두 줄 추가 (tokens 먼저, global 다음) |
| 추정 LOC | **+2줄** |
| 주의 | 기존 globals.css 는 **삭제하지 않음** — § 3-4 대로 cutover PR 까지 살려둠. § 3-1 에서 확인했듯 v2 토큰과 충돌 없음 (이름·값 동일) |
| Commit 메시지 | `chore(v2): import tokens.css and global.css in main.tsx` |

#### 4️⃣ `src/contexts/ThemeContext.tsx` (수정)

| 항목 | 값 |
|---|---|
| 의존성 | ① — tokens.css 의 `[data-theme="dark"]` 블록이 11개 공통 변수를 정의해야 안전 |
| 변경 | § 5-1 — `applyTheme()` 의 if/else `setProperty/removeProperty` 블록(`ThemeContext.tsx:25-49`) 삭제. `root.setAttribute('data-theme', resolved)` 한 줄만 남김. state/localStorage/system 감지/토글 로직은 그대로 |
| 추정 LOC | **약 -25줄** (50줄 → 약 25줄) |
| 회귀 영향 | 기존 `src/pages/`, `src/components/` 다크 모드 그대로 동작 — JS 주입하던 변수와 같은 이름·값을 CSS 가 정의하므로 |
| 주의 | CLAUDE.md 절대 규칙은 `src/pages/`, `src/components/` 수정 금지. `src/contexts/` 는 금지 대상 아님. 단 부담 시 `src/contexts-v2/ThemeContext.tsx` 신규로 두는 안도 가능 (§ 5-1 참고) |
| Commit 메시지 | `refactor(theme): drop JS setProperty, rely on CSS [data-theme]` |

#### PR 단위 합산
- 총 변경 파일: **3 신규 + 2 수정 = 4 파일** (main.tsx 포함)
- 총 LOC 변화: **약 +280 ~ +330** / **-25** (신규 토큰/글로벌 추가, ThemeContext 슬림)
- PR 사이즈: 리뷰 1회로 머지 가능한 수준

---

### Phase 0 두 번째 PR — Layout chrome (별도 PR)

§ 4 시나리오 A 결정 시 따라오는 작업. 토큰 plan 의 범위는 아니지만 의존 관계 표기만:

#### 5️⃣ `src/styles-v2/components/ide-chrome.css` (신규, Layout PR 에 포함)

| 항목 | 값 |
|---|---|
| 의존성 | ①, ② (변수 + 폰트) |
| 내용 | `prototype/ide-theme.css:78-806` 의 **클래스 정의 부분** (`.ide`, `.ide-title`, `.tab`, `.gutter`, `.editor-*`, `.json-card`, `.terminal`, `.palette*`, `.stack-trace`, `.code-input`, `.chip`, `.btn-term`, `.flat-card`, `.form-row`, `.status-chip`, `.act-*`, `.side-*`, `.term-*`, `.kbd`, `.mono`, `.sans` 등). **토큰 정의(`:root`, `[data-theme="dark"]`)는 제외** — 이미 ① 에 옮겨졌으므로 |
| 추정 LOC | **약 700줄** |
| 분리 이유 | § 2-9 / § 4 의 "글로벌에 들어가지 않는 항목" 정책. global.css 비대화 방지 |
| Commit / PR | Layout chrome PR 의 별도 commit. tokens plan 의 후속 작업 |

#### 6️⃣ `src/components-v2/Layout/` 컴포넌트들 (신규, Layout PR)

| 항목 | 값 |
|---|---|
| 의존성 | ①, ②, ⑤ |
| 내용 | `prototype/Layout.jsx` 를 분해해서 IdeShell / TitleBar / ActivityBar / Sidebar / TabBar / StatusBar / Minimap 컴포넌트로 — **각각 1 commit** (CLAUDE.md 절대 규칙: 컴포넌트 1개씩) |
| 추정 LOC | 컴포넌트당 50~150줄 — 총 약 600~800줄 |
| Commit / PR | Layout chrome PR 의 컴포넌트별 commit |

---

### 의존성 그래프

```
①  tokens.css ─┬─→ ②  global.css ─→ ③  main.tsx import
               │
               ├─→ ④  ThemeContext refactor
               │
               └─→ ⑤  ide-chrome.css ─→ ⑥  Layout 컴포넌트들
                                       (Phase 0 두 번째 PR)
```

### 체크리스트 (PR 작성 전 확인)

- [ ] § 4 의 A/B 결정이 확정됐는가 — A 미확정이면 ① 의 IDE 토큰 22개를 제외하고 90개로 시작 후 후속 PR 에서 추가
- [ ] § 5-4 의 a/b/c 결정이 확정됐는가 — a 미확정이면 ① 다크 오버라이드의 surface/text/border 값을 보류
- [ ] `src/contexts/` 인플레이스 수정에 팀 합의가 있는가 — 부담 시 `src/contexts-v2/` 로 분기 (§ 5-1)
- [ ] 기존 globals.css 는 cutover PR 까지 **건드리지 않음** — § 3-4 대로 cutover 시 일괄 폐기

### PR 머지 후 다음 단계 신호

①~④ 머지되면 다음 PR 부터 `src/components-v2/`, `src/pages-v2/` 의 모든 신규 코드가 v2 토큰을 안전하게 사용 가능. Layout chrome PR(⑤⑥)이 들어가야 페이지 단위 작업(Login/Cart/MyPage/EventDetail/EventList/Landing) 의 시각 검수가 가능해짐.
