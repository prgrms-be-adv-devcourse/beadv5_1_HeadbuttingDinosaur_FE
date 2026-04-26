import { useState } from 'react';

import { Button } from '@/components-v2/Button';
import { Card } from '@/components-v2/Card';
import { Icon } from '@/components-v2/Icon';
import { QuantityStepper } from '@/components-v2/QuantityStepper';

import { usePurchaseActions } from '../hooks';
import type { EventDetailVM } from '../types';
import { PriceSummary } from './PriceSummary';

export interface PurchasePanelProps {
  vm: EventDetailVM;
}

export function PurchasePanel({ vm }: PurchasePanelProps) {
  const [qty, setQty] = useState(1);
  const { busy, addToCart, buyNow } = usePurchaseActions(vm.eventId);

  const showQuantity = !vm.isFree && vm.canBuy;
  const isBusy = busy !== null;

  return (
    <div className="ed-purchase-sticky">
      <Card padding="none" className="ed-purchase">
        <div className="ed-purchase__inner">
          <div className="ed-price__label">티켓 가격</div>
          <div className={`ed-price__amount${vm.isFree ? ' is-free' : ''}`}>
            {vm.isFree ? '무료' : `${vm.price.toLocaleString()}원`}
          </div>

          {showQuantity && (
            <div className="ed-quantity">
              <div className="ed-quantity__label">수량</div>
              <QuantityStepper
                value={qty}
                onChange={setQty}
                min={1}
                max={vm.remainingQuantity}
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
                매진된 이벤트입니다
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
