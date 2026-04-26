import type { ReactElement } from 'react'
import { useUiVersion } from './useUiVersion'

type VersionedRouteProps = {
  v1: ReactElement
  v2?: ReactElement
}

export function VersionedRoute({ v1, v2 }: VersionedRouteProps): ReactElement {
  const version = useUiVersion()
  return version === '2' && v2 ? v2 : v1
}
