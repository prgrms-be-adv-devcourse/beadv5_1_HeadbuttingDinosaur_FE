## 프론트엔드 디자인 가이드

v2 디자인이 메인 트리에 통합됨. cutover 이전 설계 문서는
@docs/archive/v2-cutover/ 에 보존.

- 디자인 & API 스펙: @docs/archive/v2-cutover/Spec.md
- 작업 가이드: @docs/archive/v2-cutover/WORKFLOW.md
- 시각 참고 프로토타입: @docs/archive/v2-cutover/prototype/

### 절대 규칙
- 모든 API 응답은 페이지별 adapters.ts 거쳐서 VM으로 변환
- 프로토타입의 인라인 style, window.*, useStateA 별칭은 가져오지 않음
- 프로토타입의 mock 데이터는 코드에 들어가면 안 됨 (반드시 실제 API)

작업 시작 전 항상 Spec.md의 § 0 공통 규칙과 § 10 API 가이드 확인.
