import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/Button';
import { SectionHead } from '@/components/SectionHead';

const PLACEHOLDER_CARDS = [
  { category: 'CONFERENCE', title: '당신만을 위한 추천 이벤트', date: '2026.05.10', price: '49,000원' },
  { category: 'MEETUP',     title: '취향 저격 밋업 모음',         date: '2026.05.18', price: '무료' },
  { category: 'HACKATHON',  title: '관심 분야 해커톤',             date: '2026.06.01', price: '29,000원' },
  { category: 'STUDY',      title: '맞춤 스터디 추천',             date: '2026.06.12', price: '무료' },
];

export function RecommendedTeaser() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?returnTo=${returnTo}`);
  };

  return (
    <section className="ed-rec-section ed-rec-teaser" aria-label="추천 이벤트 (로그인 필요)">
      <SectionHead hint="recommended" title="당신에게 맞는 이벤트" />
      <div className="ed-rec-teaser__wrap">
        <div className="ed-rec-grid ed-rec-teaser__blur" aria-hidden="true">
          {PLACEHOLDER_CARDS.map((c, i) => (
            <div key={i} className="ed-rec-card">
              <span className="ed-rec-card__category">{c.category}</span>
              <h3 className="ed-rec-card__title">{c.title}</h3>
              <div className="ed-rec-card__meta">
                <span className="ed-rec-card__date">{c.date}</span>
                <span className="ed-rec-card__price">{c.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="ed-rec-teaser__overlay">
          <p className="ed-rec-teaser__msg">
            로그인하면 나에게 꼭 맞는 추천 이벤트를 볼 수 있어요!
          </p>
          <Button variant="primary" onClick={handleLogin}>
            로그인하기
          </Button>
        </div>
      </div>
    </section>
  );
}

RecommendedTeaser.displayName = 'RecommendedTeaser';
