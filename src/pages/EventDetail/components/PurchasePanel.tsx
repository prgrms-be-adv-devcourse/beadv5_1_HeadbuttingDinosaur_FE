import { useState } from 'react';

import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { QuantityStepper } from '@/components/QuantityStepper';

import { usePurchaseActions } from '../hooks';
import type { EventDetailVM } from '../types';
import { PriceSummary } from './PriceSummary';
import { SaleCountdown } from './SaleCountdown';

export interface PurchasePanelProps {
  vm: EventDetailVM;
}

const unavailableLabel = (vm: EventDetailVM): string => {
  if (vm.isScheduled) return '판매 예정 이벤트입니다';
  if (vm.status === 'CANCELLED') return '취소된 이벤트입니다';
  if (vm.status === 'ENDED') return '종료된 이벤트입니다';
  if (vm.status === 'SALE_ENDED') return '판매가 종료된 이벤트입니다';
  if (vm.status === 'SOLD_OUT' || vm.isSoldOut) return '매진된 이벤트입니다';
  return '구매할 수 없는 이벤트입니다';
};

export function PurchasePanel({ vm }: PurchasePanelProps) {
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const { busy, addToCart, buyNow } = usePurchaseActions(vm.eventId);

  const showQuantity = !vm.isFree && vm.canBuy;
  const isBusy = busy !== null;
  const showCountdown = vm.isScheduled && Boolean(vm.saleStartAt);
  const perUserMax = vm.maxQuantityPerUser;
  const effectiveMax =
    perUserMax !== undefined
      ? Math.min(vm.remainingQuantity, perUserMax)
      : vm.remainingQuantity;

  const handleQtyChange = (next: number) => {
    if (perUserMax !== undefined && next > perUserMax) {
      toast(
        `1인당 최대 ${perUserMax.toLocaleString()}장까지 구매 가능합니다.`,
        'error',
      );
      setQty(perUserMax);
      return;
    }
    if (next > vm.remainingQuantity) {
      toast(
        `잔여 수량을 초과했습니다. 최대 ${vm.remainingQuantity.toLocaleString()}장까지 구매 가능합니다.`,
        'error',
      );
      setQty(vm.remainingQuantity);
      return;
    }
    setQty(next);
  };

  return (
    <div className="ed-purchase-sticky">
      <Card padding="none" className="ed-purchase">
        <div className="ed-purchase__inner">
          <div className="ed-price__label">티켓 가격</div>
          <div className={`ed-price__amount${vm.isFree ? ' is-free' : ''}`}>
            {vm.isFree ? '무료' : `${vm.price.toLocaleString()}원`}
          </div>

          {showCountdown && (
            <div className="ed-countdown-wrap">
              <div className="ed-countdown__label">판매 시작까지</div>
              <SaleCountdown targetIso={vm.saleStartAt!} />
            </div>
          )}

          {showQuantity && (
            <div className="ed-quantity">
              <div className="ed-quantity__label">수량</div>
              <QuantityStepper
                value={qty}
                onChange={handleQtyChange}
                min={1}
                max={effectiveMax}
                size="md"
                disabled={isBusy}
              />
            </div>
          )}

          <PriceSummary total={vm.price * qty} hidden={!vm.canBuy} />

          <div className="ed-purchase__actions">
            {vm.canBuy ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  full
                  onClick={() => buyNow(qty)}
                  disabled={isBusy}
                >
                  {busy === 'buying' ? '이동 중…' : '바로 구매하기'}
                </Button>
                <Button
                  variant="ghost"
                  full
                  iconStart={<Icon name="cart" size={13} />}
                  onClick={() => addToCart(qty)}
                  disabled={isBusy}
                >
                  {busy === 'adding' ? '담는 중…' : '장바구니에 담기'}
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="lg" full disabled>
                {unavailableLabel(vm)}
              </Button>
            )}
          </div>

          <div className="ed-notice">
            결제 완료 후 티켓이 즉시 발급됩니다.
            <br />
            행사 7일 전까지 100% 환불이 가능합니다.
          </div>
        </div>
      </Card>
    </div>
  );
}

PurchasePanel.displayName = 'PurchasePanel';
