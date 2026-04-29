/**
 * 백엔드 EventCategory enum (com.devticket.event.domain.enums.EventCategory) 매핑.
 *
 *   MEETUP("소모임"), CONFERENCE("컨퍼런스"), HACKATHON("해커톤"),
 *   STUDY("스터디"), PROJECT("프로젝트")
 *
 * UI 라벨은 한글(description), API 에는 enum 키(영문)를 보낸다.
 */

export const EVENT_CATEGORY_LABELS = ['소모임', '컨퍼런스', '해커톤', '스터디', '프로젝트'] as const;

export type EventCategoryLabel = (typeof EVENT_CATEGORY_LABELS)[number];
export type EventCategoryEnum = 'MEETUP' | 'CONFERENCE' | 'HACKATHON' | 'STUDY' | 'PROJECT';

export const CATEGORY_LABEL_TO_ENUM: Record<EventCategoryLabel, EventCategoryEnum> = {
  소모임: 'MEETUP',
  컨퍼런스: 'CONFERENCE',
  해커톤: 'HACKATHON',
  스터디: 'STUDY',
  프로젝트: 'PROJECT',
};

export const CATEGORY_ENUM_TO_LABEL: Record<EventCategoryEnum, EventCategoryLabel> = {
  MEETUP: '소모임',
  CONFERENCE: '컨퍼런스',
  HACKATHON: '해커톤',
  STUDY: '스터디',
  PROJECT: '프로젝트',
};

/**
 * 한글 라벨 또는 enum 키 어느 쪽이 들어와도 enum 키를 돌려준다.
 * 백엔드가 응답에 enum 키를 보낼 때도 있고 description 을 보낼 때도 있어
 * 양쪽을 흡수하기 위함. enum 키는 대소문자 구분 없이 매칭한다 (백엔드가
 * `meetup` 처럼 소문자를 보내는 케이스 방어).
 */
export const toCategoryEnum = (raw: string | null | undefined): EventCategoryEnum | null => {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;
  const upper = trimmed.toUpperCase();
  if (upper in CATEGORY_ENUM_TO_LABEL) return upper as EventCategoryEnum;
  if (trimmed in CATEGORY_LABEL_TO_ENUM) return CATEGORY_LABEL_TO_ENUM[trimmed as EventCategoryLabel];
  return null;
};

/** 매핑 불가/누락 시 노출할 기본 라벨. "#UNDEFINED" 같은 raw 노출을 방지. */
export const FALLBACK_CATEGORY_LABEL = '기타';

/** UI 표시용 — enum 키든 한글이든 한글 라벨로. 매핑 실패 시 fallback. */
export const toCategoryLabel = (raw: string | null | undefined): string => {
  const e = toCategoryEnum(raw);
  if (e) return CATEGORY_ENUM_TO_LABEL[e];
  /* 한글 라벨/enum 어느 쪽도 아닌 값(`UNDEFINED`, null, '' 등)은 "기타" 로
   * 통일. 호출자(EventList/Landing/EventDetail/Recommendation 어댑터)가
   * 모두 같은 처리를 받도록 한 곳에서 흡수한다. */
  return FALLBACK_CATEGORY_LABEL;
};
