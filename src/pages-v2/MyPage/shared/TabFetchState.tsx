import type { ReactNode } from 'react';
import { TabErrorBox } from './TabErrorBox';

export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'ready'; data: T };

interface TabFetchStateProps<T> {
  state: FetchState<T>;
  skeleton: ReactNode;
  empty?: { when: (data: T) => boolean; render: ReactNode };
  children: (data: T) => ReactNode;
}

export function TabFetchState<T>({
  state,
  skeleton,
  empty,
  children,
}: TabFetchStateProps<T>) {
  if (state.status === 'loading') return <>{skeleton}</>;
  if (state.status === 'error') return <TabErrorBox onRetry={state.retry} />;
  if (empty?.when(state.data)) return <>{empty.render}</>;
  return <>{children(state.data)}</>;
}
