import { useEffect, useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';

interface Coords {
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    kakao?: {
      maps?: {
        services?: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              cb: (result: Array<{ x: string; y: string }>, status: string) => void,
            ) => void;
          };
          Status: { OK: string };
        };
      };
    };
  }
}

export interface EventMapProps {
  location: string;
}

/**
 * 카카오맵으로 이벤트 위치 표시. v1 (`src/components/EventMap.tsx`) 의
 * 컴포넌트를 EventDetail 내부 컴포넌트로 옮겨와 동일한 UX 를 복원.
 *
 * `VITE_KAKAO_MAP_KEY` 의 JS 키를 사용하며, geocoder 로 주소 → 좌표 변환 후
 * 마커 표시. 키 부재/지오코딩 실패 시엔 fallback 박스로 안내.
 */
export function EventMap({ location }: EventMapProps) {
  const [sdkLoading, sdkError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY as string,
    libraries: ['services'],
  });

  const [coords, setCoords] = useState<Coords | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'ok' | 'error'>(
    'idle',
  );

  useEffect(() => {
    if (sdkLoading || !location) return;

    if (sdkError || !window.kakao?.maps?.services) {
      setGeocodeStatus('error');
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(location, (result, status) => {
      if (
        status === window.kakao!.maps!.services!.Status.OK &&
        result.length > 0
      ) {
        setCoords({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
        setGeocodeStatus('ok');
      } else {
        setGeocodeStatus('error');
      }
    });
  }, [sdkLoading, sdkError, location]);

  if (sdkLoading || geocodeStatus === 'idle') {
    return (
      <div className="ed-map ed-map--placeholder">
        <span className="ed-map__hint">지도 불러오는 중...</span>
      </div>
    );
  }

  if (geocodeStatus === 'error' || !coords) {
    return (
      <div className="ed-map ed-map--placeholder">
        <span className="ed-map__icon" aria-hidden="true">
          📍
        </span>
        <span className="ed-map__hint">지도를 불러올 수 없습니다</span>
        <span className="ed-map__sub">{location}</span>
      </div>
    );
  }

  return (
    <Map center={coords} className="ed-map" level={3}>
      <MapMarker position={coords} />
    </Map>
  );
}

EventMap.displayName = 'EventMap';
