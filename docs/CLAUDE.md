## 프론트엔드 v2 재구축 (진행 중)

기존 프론트를 프로토타입 기준으로 재구축 중. API/타입/인증 레이어는 재활용.

- 디자인 & API 스펙: @docs/redesign/SPEC.md
- 작업 가이드: @docs/redesign/WORKFLOW.md
- 시각 참고 프로토타입: @docs/redesign/prototype/

### 절대 규칙
- 신규 코드: src/pages-v2/, src/components-v2/, src/styles-v2/
- 기존 src/pages/, src/components/는 cutover PR 전까지 절대 수정 금지
- 모든 API 응답은 페이지별 adapters.ts 거쳐서 VM으로 변환
- 프로토타입의 인라인 style, window.*, useStateA 별칭은 가져오지 않음
- 프로토타입의 mock 데이터는 v2 코드에 들어가면 안 됨 (반드시 실제 API)
- 페이지 1개 작업 = plan 먼저 + PR 단위로 분할 + 컴포넌트 1개씩

작업 시작 전 항상 SPEC.md의 § 0 공통 규칙과 § 10 API 가이드 확인.