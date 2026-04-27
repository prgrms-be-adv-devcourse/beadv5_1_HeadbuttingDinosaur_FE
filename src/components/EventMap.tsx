import { useEffect, useState } from 'react'
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk'

interface Props {
  location: string
}

interface Coords {
  lat: number
  lng: number
}

export default function EventMap({ location }: Props) {
  const [sdkLoading, sdkError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY as string,
    libraries: ['services'],
  })

  const [coords, setCoords] = useState<Coords | null>(null)
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  useEffect(() => {
    if (sdkLoading || !location) return

    if (sdkError || !window.kakao?.maps?.services) {
      setGeocodeStatus('error')
      return
    }

    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(location, (result: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        setCoords({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) })
        setGeocodeStatus('ok')
      } else {
        setGeocodeStatus('error')
      }
    })
  }, [sdkLoading, sdkError, location])

  if (sdkLoading || geocodeStatus === 'idle') {
    return (
      <div style={{
        height: 280, borderRadius: 'var(--r-xl)',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)', fontSize: 14,
      }}>
        지도 불러오는 중...
      </div>
    )
  }

  if (geocodeStatus === 'error' || !coords) {
    return (
      <div style={{
        height: 280, borderRadius: 'var(--r-xl)',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, color: 'var(--text-3)', fontSize: 14,
      }}>
        <span style={{ fontSize: 28 }}>📍</span>
        <span>지도를 불러올 수 없습니다</span>
        <span style={{ fontSize: 12 }}>{location}</span>
      </div>
    )
  }

  return (
    <Map
      center={coords}
      style={{ width: '100%', height: 280, borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}
      level={3}
    >
      <MapMarker position={coords} />
    </Map>
  )
}
