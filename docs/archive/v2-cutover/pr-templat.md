# PR 본문 템플릿 (v2 재구축)

페이지 작업 PR마다 이 형식으로 `docs/redesign/{Page}.{N}.pr.md` 작성.

큰 페이지는 N/Total 형식 (예: `EventList.2.pr.md` = EventList 작업의 2번째 PR).

---

## 템플릿

```markdown
## 개요

`{Page}` 페이지 v2 신규 작성 ({N}/{Total} PR).
디자인 스펙: @docs/redesign/SPEC.md § {section}
시각 참고: @docs/redesign/prototype/{Page}.jsx

## 이 PR의 범위

(예: PR 1 — types/adapters/hooks + 핵심 카드 컴포넌트)
(예: PR 2 — 검색/필터/Hero + API 통합)

다음 PR에서 다룰 것:
- (다음 단계 미리보기)

## 변경 파일

### 신규 (v2)
- `src/pages-v2/{Page}/index.tsx`
- `src/pages-v2/{Page}/{Page}.tsx`
- `src/pages-v2/{Page}/components/...`
- `src/pages-v2/{Page}/adapters.ts`
- `src/pages-v2/{Page}/hooks.ts`
- `src/pages-v2/{Page}/types.ts`
- (기타)

### 변경 없음 (재활용)
- `src/api/{relevant}.ts` — 그대로 사용
- `src/types/{relevant}.ts` — 그대로 사용

### 라우터
- (라우터 등록한 PR이면 명시)

## API 매핑

| 프로토타입 mock 필드 | 실제 API 필드 | 변환 |
|---|---|---|
| event.eventId | event.id | 단순 매핑 |
| event.remainingQuantity | event.stock.remaining | 중첩 필드 |
| event.status | event.saleStatus | 값 변환 (OPEN→ON_SALE) |

## 처리한 상태

- [x] 정상 데이터 렌더
- [x] 로딩 (스켈레톤)
- [x] 에러 (재시도 버튼 포함)
- [x] 빈 결과 (검색어 유무 분기)
- [x] 401 → 로그인 리다이렉트
- [ ] (이번 PR에서 미처리, 다음 PR에서)

## 스크린샷

### 라이트 모드
<!-- 데스크탑 + 모바일 -->

### 다크 모드
<!-- 데스크탑 + 모바일 -->

### 상태별
<!-- 로딩, 에러, 빈 결과 등 -->

## 검증 방법

```
1. develop 체크아웃 후 이 PR 머지
2. 로컬 실행: npm run dev
3. http://localhost:{port}/{path}?v=2 접속
4. 기존 동작 확인: ?v=2 빼고 접속 → 변경 없음
```

## 검토 포인트

- [ ] mock 데이터가 v2 코드에 남아있지 않은가
- [ ] adapters.ts에 변환 로직 격리됐는가
- [ ] 컴포넌트가 API 응답 형태에 직접 의존하지 않는가
- [ ] 로딩/에러/empty 모두 처리됐는가
- [ ] 다크모드 자연스러운가
- [ ] 반응형 깨지지 않는가
- [ ] 기존 페이지 회귀 없는가 (v2 토글 OFF 시)

## 의존 PR

- (있으면) #{토큰_PR} 머지 후 머지 가능
- (있으면) #{공용_컴포넌트_PR}
- (있으면) #{같은_페이지_이전_PR}

## 후속 작업

이 PR에서 다루지 않은 것:
- (다음 PR로 이관된 항목)
- (별도 이슈로 분리한 항목)

## 의사결정 / 메모

- (이 PR에서 새로 결정한 것 — SPEC § 9에 반영했는지)
- (논의 필요한 것)
```

---

## 작성 팁

### 범위 명시 (가장 중요)
큰 페이지는 PR 여러 개로 나뉘니까, 각 PR이 어디까지인지 명확히.
- "EventList — 시각 컴포넌트만, API 미연동" ✅
- "EventList 작업" ❌

### API 매핑은 실제 변경된 항목만
어댑터에 들어간 변환만. 단순 1:1 매핑은 생략 가능. 변환 로직 있는 것만 표 작성.

### 검증 방법은 구체적으로
리뷰어가 그대로 따라할 수 있게:
- ❌ "동작 확인했음"
- ✅ "로컬에서 `?v=2`로 접속, 검색어 'react' 입력, 결과 8개 → 카테고리 'JS' 클릭 → 4개로 필터됨 확인"

### 스크린샷
- 같은 데이터로 같은 viewport
- 라이트/다크 둘 다
- 데스크탑 + 모바일 최소 2 사이즈
- **실제 빌드된 화면** (Figma 모의가 아님)
- 에러/빈 상태도 강제 발생시켜 캡처

### 의존성
- 토큰/공용 컴포넌트 PR이 먼저 머지되어야 하면 명시
- 같은 페이지의 이전 PR도 명시