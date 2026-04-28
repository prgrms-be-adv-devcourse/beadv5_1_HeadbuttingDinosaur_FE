/**
 * Landing 페이지 전용 타입.
 * PR 1 (TypedTerminal) 단계에서는 `TerminalLine` 만 정의.
 * StatVM / CategoryTileVM / FeaturedItemVM / LandingFirstPageQuery 등은
 * PR 2~3 진입 시 본 파일에 추가 (Landing.plan.md §12.2~).
 */

export interface TerminalLine {
  /** 프롬프트 표시용 ('~' 등) */
  prompt: string;
  /** 한 글자씩 타이핑되는 명령어 */
  cmd: string;
  /** cmd 완료 후 노출되는 출력 라인 */
  out: string;
}
