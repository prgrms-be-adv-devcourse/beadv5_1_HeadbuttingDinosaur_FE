/**
 * 일반 사용자 한정 — 판매자 전환 신청 카드.
 *
 * 진입 시 `getSellerApplicationStatus` 로 기존 신청 여부 확인.
 * - 신청 이력 없음 / REJECTED → "신청하기" 버튼으로 `/seller-apply` 이동
 * - PENDING / APPROVED → 현재 상태 배지 + 안내 문구만 노출
 *
 * 폼 자체는 v1 그대로 `/seller-apply` 페이지에 두고, MyPage 에서는 상태
 * 안내 + 진입 버튼만 제공 (v1 SettingsTab 패턴과 동일).
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSellerApplicationStatus } from '@/api/auth.api';
import { unwrapApiData } from '@/api/client';
import type { SellerApplicationStatusResponse } from '@/api/types';
import { Button, Card } from '@/components';

type Status = SellerApplicationStatusResponse['status'];

const STATUS_COPY: Record<Status, { label: string; tone: string; desc: string }> = {
  PENDING: {
    label: '심사 중',
    tone: 'warning',
    desc: '관리자가 신청을 검토 중입니다. 영업일 기준 1~3일 내 처리됩니다.',
  },
  APPROVED: {
    label: '승인 완료',
    tone: 'success',
    desc: '판매자 권한이 부여되었습니다. 페이지를 새로고침하면 판매자 센터가 활성화됩니다.',
  },
  REJECTED: {
    label: '반려됨',
    tone: 'danger',
    desc: '신청이 반려되었습니다. 정보를 수정 후 다시 신청해주세요.',
  },
};

export function SellerApplicationCard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SellerApplicationStatusResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSellerApplicationStatus()
      .then((res) => {
        if (cancelled) return;
        setStatus(unwrapApiData(res.data));
      })
      .catch(() => {
        // 신청 이력 없음 — null 유지.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = status ? STATUS_COPY[status.status] : null;
  const canApply = !status || status.status === 'REJECTED';

  return (
    <Card variant="solid" className="settings-card seller-apply-card">
      <div className="seller-apply-card__head">
        <div>
          <h2 className="settings-card__title">판매자 전환 신청</h2>
          <p className="seller-apply-card__desc">
            이벤트를 직접 등록하고 티켓을 판매할 수 있습니다.
          </p>
        </div>
        {canApply && !loading && (
          <Button variant="primary" size="sm" onClick={() => navigate('/seller-apply')}>
            신청하기
          </Button>
        )}
      </div>
      {copy && status && (
        <div className={`seller-apply-card__status seller-apply-card__status--${copy.tone}`}>
          <div className="seller-apply-card__status-row">
            <span className={`seller-apply-card__badge seller-apply-card__badge--${copy.tone}`}>
              {copy.label}
            </span>
            <span className="seller-apply-card__date">
              {new Date(status.createdAt).toLocaleDateString('ko-KR')} 신청
            </span>
          </div>
          <p className="seller-apply-card__msg">{copy.desc}</p>
          {status.status === 'REJECTED' && status.rejectionReason && (
            <p className="seller-apply-card__reason">
              사유: {status.rejectionReason}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

SellerApplicationCard.displayName = 'SellerApplicationCard';
