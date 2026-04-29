import { Eyebrow } from '@/components/Eyebrow';
import { Kbd } from '@/components/Kbd';

export interface HeroProps {
  totalCount: number;
}

export function Hero({ totalCount }: HeroProps) {
  return (
    <div className="el-hero">
      <Eyebrow tone="term-green" size="md">
        개발자를 위한 이벤트 플랫폼
      </Eyebrow>
      <h1 className="el-hero__title">다음 컨퍼런스를 찾아보세요</h1>
      <p className="el-hero__copy">
        컨퍼런스, 소모임, 해커톤, 스터디, 프로젝트까지 — {totalCount.toLocaleString()}개의 이벤트가 기다리고 있습니다.
      </p>
      <div className="el-hero__hints">
        <span><Kbd>⌘K</Kbd> 검색</span>
        <span><Kbd>/</Kbd> 검색창 포커스</span>
      </div>
    </div>
  );
}
