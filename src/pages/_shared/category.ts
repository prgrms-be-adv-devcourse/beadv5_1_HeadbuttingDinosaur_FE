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
 * 양쪽을 흡수하기 위함.
 */
export const toCategoryEnum = (raw: string): EventCategoryEnum | null => {
  if (raw in CATEGORY_ENUM_TO_LABEL) return raw as EventCategoryEnum;
  if (raw in CATEGORY_LABEL_TO_ENUM) return CATEGORY_LABEL_TO_ENUM[raw as EventCategoryLabel];
  return null;
};

/** UI 표시용 — enum 키든 한글이든 한글 라벨로. */
export const toCategoryLabel = (raw: string): string => {
  const e = toCategoryEnum(raw);
  return e ? CATEGORY_ENUM_TO_LABEL[e] : raw;
};
