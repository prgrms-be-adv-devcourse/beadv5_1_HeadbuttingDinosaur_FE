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
(작성 예정)

## 4. IDE 전용 토큰 처리 방침
(작성 예정)

## 5. 다크모드 [data-theme="dark"] 스코프
(작성 예정)

## 6. 파일 생성 순서 (구현 시 참고)
(작성 예정)
