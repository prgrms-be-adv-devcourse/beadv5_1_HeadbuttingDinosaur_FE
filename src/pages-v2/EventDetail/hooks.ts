import { useMemo } from 'react';

import { sampleEventDetail } from './__mocks__/sampleEventDetail';
import type { EventDetailQuery } from './types';

// PR 1 한정 스텁. eventId 와 무관하게 항상 같은 mock VM 으로 success 반환.
// PR 2 에서 getEventDetail 호출 + 캐시 + AbortController 기반 실 구현으로 교체.

export function useEventDetail(
  _eventId: string,
): EventDetailQuery & { refetch: () => void } {
  return useMemo(
    () => ({
      status: 'success' as const,
      data: sampleEventDetail,
      fetchedAt: Date.now(),
      refetch: () => {},
    }),
    [],
  );
}
