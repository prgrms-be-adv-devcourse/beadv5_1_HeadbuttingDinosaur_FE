/**
 * 결제 콜백 페이지 훅.
 *
 * - `usePaymentConfirm` — `/payment/success` 진입 시 sessionStorage
 *   `payment_context` + URL 쿼리(paymentKey/orderId/amount) 검증 → confirm
 *   API 호출 → `ConfirmQuery` 노출. 성공 시 `/payment/complete` 로 보낼
 *   `completePayload` 도 함께 채운다(컨테이너가 1.5s 후 navigate).
 *
 * - `usePaymentFail` — `/payment/fail` 진입 시 URL 의 code/message 와
 *   sessionStorage 컨텍스트로 `failPayment` fire-and-forget 호출 후
 *   `PaymentFailVM` 반환.
 *
 * - `useCompletePayload` — `/payment/complete` 의 location.state 를
 *   `PaymentCompleteVM` 으로 정규화. state 가 없으면 `null` 을 반환하고
 *   컨테이너가 `/` 로 redirect 처리.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import { confirmPayment, failPayment } from '@/api/payments.api';

import type {
  ConfirmQuery,
  PaymentCompleteVM,
  PaymentFailVM,
  PaymentMethod,
  PaymentSuccessVM,
} from './types';

const PAYMENT_CONTEXT_KEY = 'payment_context';

interface SessionPaymentContext {
  paymentId: string;
  orderId: string;
  totalAmount?: number;
  method?: PaymentMethod;
}

const readPaymentContext = (): SessionPaymentContext | null => {
  const raw = sessionStorage.getItem(PAYMENT_CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPaymentContext;
  } catch {
    return null;
  }
};

const clearPaymentContext = () =>
  sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);

const errorMessageOf = (e: unknown): string => {
  const fallback = '결제 승인 처리에 실패했습니다.';
  if (typeof e !== 'object' || e === null) return fallback;
  const data = (e as { response?: { data?: { message?: string } } }).response
    ?.data;
  return data?.message ?? fallback;
};

// ── usePaymentConfirm ────────────────────────────────────────────────────────

export interface UsePaymentConfirmReturn {
  query: ConfirmQuery;
  /** confirm 성공 시 채워짐. 컨테이너가 1.5s 지연 후 navigate(state). */
  completePayload: PaymentCompleteVM | null;
}

export function usePaymentConfirm(): UsePaymentConfirmReturn {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState<ConfirmQuery>({ status: 'loading' });
  const [completePayload, setCompletePayload] =
    useState<PaymentCompleteVM | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const tossOrderId = searchParams.get('orderId'); // = 우리 paymentId
    const amountStr = searchParams.get('amount');
    const ctx = readPaymentContext();

    if (!paymentKey || !tossOrderId || !amountStr || !ctx) {
      setQuery({ status: 'error', message: '결제 정보가 유효하지 않습니다.' });
      clearPaymentContext();
      return;
    }

    const amount = Number(amountStr);
    let cancelled = false;

    confirmPayment({
      paymentId: ctx.paymentId,
      paymentKey,
      orderId: ctx.orderId,
      amount,
    })
      .then(() => {
        if (cancelled) return;
        const method = ctx.method ?? 'PG';
        const data: PaymentSuccessVM = {
          orderId: ctx.orderId,
          amount: ctx.totalAmount ?? amount,
          method,
        };
        setQuery({ status: 'success', data });
        setCompletePayload({
          paymentId: ctx.paymentId,
          orderId: ctx.orderId,
          amount: ctx.totalAmount ?? amount,
          method,
          approvedAt: new Date().toISOString(),
        });
        clearPaymentContext();
      })
      .catch((err) => {
        if (cancelled) return;
        setQuery({ status: 'error', message: errorMessageOf(err) });
        clearPaymentContext();
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return { query, completePayload };
}

// ── usePaymentFail ───────────────────────────────────────────────────────────

export function usePaymentFail(): PaymentFailVM {
  const [searchParams] = useSearchParams();

  const data = useMemo<PaymentFailVM>(
    () => ({
      code: searchParams.get('code') ?? '알 수 없는 오류',
      message:
        searchParams.get('message') ?? '결제 처리 중 문제가 발생했습니다.',
    }),
    [searchParams],
  );

  useEffect(() => {
    const ctx = readPaymentContext();
    if (ctx?.paymentId && ctx?.orderId) {
      failPayment({
        paymentId: ctx.paymentId,
        orderId: ctx.orderId,
        code: data.code,
        message: data.message,
      }).catch(() => {
        /* fire-and-forget — v1 동작 유지 */
      });
    }
    clearPaymentContext();
  }, [data.code, data.message]);

  return data;
}

// ── useCompletePayload ───────────────────────────────────────────────────────

export function useCompletePayload(): PaymentCompleteVM | null {
  const { state } = useLocation();

  if (!state || typeof state !== 'object') return null;
  const s = state as Partial<PaymentCompleteVM>;
  if (!s.orderId || typeof s.amount !== 'number') return null;
  return {
    paymentId: s.paymentId,
    orderId: s.orderId,
    amount: s.amount,
    method: s.method,
    approvedAt: s.approvedAt,
  };
}
