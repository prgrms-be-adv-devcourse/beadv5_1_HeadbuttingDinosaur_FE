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
(작성 예정)

## 3. 기존 토큰과 충돌 / alias 필요 항목
(작성 예정)

## 4. IDE 전용 토큰 처리 방침
(작성 예정)

## 5. 다크모드 [data-theme="dark"] 스코프
(작성 예정)

## 6. 파일 생성 순서 (구현 시 참고)
(작성 예정)
