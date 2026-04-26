import { Card } from '@/components-v2/Card';

import { Breadcrumb } from './Breadcrumb';

export function EventDetailSkeleton() {
  return (
    <div className="editor-scroll">
      <div className="gutter" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className={`ln${i === 0 ? ' active' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-body" aria-busy="true">
        <Breadcrumb title="이벤트" />
        <div className="ed-grid">
          <div className="ed-main">
            <div className="ed-skel ed-skel-hero" />
            <div className="ed-skel-row">
              <div className="ed-skel ed-skel-line" style={{ width: 80 }} />
              <div className="ed-skel ed-skel-line" style={{ width: 56 }} />
            </div>
            <div className="ed-skel ed-skel-title" />
            <div className="ed-skel-chips">
              <div className="ed-skel ed-skel-chip" />
              <div className="ed-skel ed-skel-chip" />
              <div className="ed-skel ed-skel-chip" />
            </div>
            <Card padding="none" className="ed-skel-info">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="ed-skel-info-row">
                  <div className="ed-skel ed-skel-info-label" />
                  <div className="ed-skel ed-skel-info-value" />
                </div>
              ))}
            </Card>
            <div className="ed-skel ed-skel-desc-title" />
            <div className="ed-skel ed-skel-desc-line" style={{ width: '95%' }} />
            <div className="ed-skel ed-skel-desc-line" style={{ width: '88%' }} />
            <div className="ed-skel ed-skel-desc-line" style={{ width: '60%' }} />
          </div>
          <div className="ed-purchase-sticky">
            <Card padding="none" className="ed-purchase">
              <div className="ed-skel-panel">
                <div className="ed-skel ed-skel-price-label" />
                <div className="ed-skel ed-skel-price-amount" />
                <div className="ed-skel ed-skel-button" />
                <div className="ed-skel ed-skel-button" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

EventDetailSkeleton.displayName = 'EventDetailSkeleton';
