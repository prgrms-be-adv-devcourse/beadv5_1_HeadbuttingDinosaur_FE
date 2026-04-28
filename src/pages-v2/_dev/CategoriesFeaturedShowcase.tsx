/**
 * 임시 dev 라우트 (`/_dev/landing-categories-featured`).
 * Landing.plan.md §12.3 검증 절차 A~E 를 라이브로 확인하기 위한 마운트 셸.
 * 실제 API 와 결선된 <CategoriesSection> + <FeaturedSection> 단독 렌더.
 *
 * - 타일/행 클릭은 CategoriesSection / FeaturedSection 내부의 useNavigate
 *   가 그대로 동작 (§12.3 검증 6/7). React Router Provider 가 App.tsx
 *   위에 있어 dev 라우트에서도 nav OK.
 * - "전체 보기 →" 도 useNavigate 결선 — `/events?v=2` 로 이동.
 *
 * cutover 또는 PR 4 cleanup 커밋에서 제거 예정.
 */

import { CategoriesSection } from '../Landing/sections/CategoriesSection';
import { FeaturedSection } from '../Landing/sections/FeaturedSection';
import {
  useFeaturedEvents,
  useLandingCategories,
} from '../Landing/hooks';

export default function CategoriesFeaturedShowcase() {
  const categories = useLandingCategories();
  const featured = useFeaturedEvents();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>
          Landing Categories + Featured — dev showcase
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>
          Landing.plan.md §12.3 검증.{' '}
          <code>/_dev/landing-categories-featured</code>
        </p>
      </header>

      <CategoriesSection query={categories} />
      <FeaturedSection query={featured} />
    </div>
  );
}
