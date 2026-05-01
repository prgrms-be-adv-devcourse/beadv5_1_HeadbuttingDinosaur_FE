import { apiClient, ApiResponse } from "./client";
import type {
  EventListRequest,
  EventListResponse,
  EventDetailResponse,
  EventSearchRequest,
  EventSearchResponse,
  EventFilterRequest,
  EventFilterResponse,
  SellerEventCreateRequest,
  SellerEventCreateResponse,
  SellerEventListRequest,
  SellerEventListResponse,
  SellerEventDetailResponse,
  SellerEventUpdateRequest,
  SellerEventUpdateResponse,
  SellerEventForceCancelResponse,
  SellerEventForceCancelRequest,
  SellerEventSummaryResponse,
  SellerEventParticipantListRequest,
  SellerEventParticipantListResponse,
  SellerEventRefundListRequest,
  SellerEventRefundListResponse,
} from "./types";

// ── 공개 이벤트 ────────────────────────────────────────────────────────────────
export const getEvents = (params?: EventListRequest) =>
  apiClient.get<ApiResponse<EventListResponse>>("/events", { params });

export const getEventDetail = (eventId: string) =>
  apiClient.get<ApiResponse<EventDetailResponse>>(`/events/${eventId}`);

export const searchEvents = (params: EventSearchRequest) =>
  apiClient.get<ApiResponse<EventSearchResponse>>("/events", { params });

export const filterEvents = (params: EventFilterRequest) =>
  apiClient.get<ApiResponse<EventFilterResponse>>("/events", { params });

// ── 판매자 이벤트 ──────────────────────────────────────────────────────────────
export const createSellerEvent = (body: SellerEventCreateRequest) =>
  apiClient.post<ApiResponse<SellerEventCreateResponse>>(
    "/seller/events",
    body,
  );

export const getSellerEvents = (params?: SellerEventListRequest) =>
  apiClient.get<ApiResponse<SellerEventListResponse>>("/seller/events", {
    params,
  });

export const getSellerEventDetail = (eventId: string) =>
  apiClient.get<ApiResponse<SellerEventDetailResponse>>(
    `/seller/events/${eventId}`,
  );

export const updateSellerEvent = (
  eventId: string,
  body: SellerEventUpdateRequest,
) =>
  apiClient.patch<ApiResponse<SellerEventUpdateResponse>>(
    `/seller/events/${eventId}`,
    body,
  );

/**
 * Action A — 이벤트 강제 취소 (환불 동반).
 * 이벤트 상태가 FORCE_CANCELLED 로 전이되며, 결제 완료 구매자에게 환불 fan-out 이 시작된다.
 * 신규 판매만 막고 기존 구매자에게 영향을 주지 않으려면 updateSellerEvent({ status: 'CANCELLED' })
 * (= Action B 판매 중지) 를 사용하라.
 */
export const forceCancelSellerEvent = (
  eventId: string,
  body: SellerEventForceCancelRequest,
) =>
  apiClient.post<ApiResponse<SellerEventForceCancelResponse>>(
    `/seller/events/${eventId}/cancel`,
    body,
  );

/** @deprecated forceCancelSellerEvent 로 이전 — 이름이 의도(환불 동반)와 달라 혼선 유발. */
export const stopSellerEvent = forceCancelSellerEvent;

export const getSellerEventSummary = (eventId: string) =>
  apiClient.get<ApiResponse<SellerEventSummaryResponse>>(
    `/seller/events/${eventId}/statistics`,
  );

export const getSellerEventParticipants = (
  eventId: string,
  params?: SellerEventParticipantListRequest,
) =>
  apiClient.get<ApiResponse<SellerEventParticipantListResponse>>(
    `/seller/events/${eventId}/participants`,
    { params },
  );

export const getSellerEventRefunds = (
  eventId: string,
  params?: SellerEventRefundListRequest,
) =>
  apiClient.get<ApiResponse<SellerEventRefundListResponse>>(
    `/seller/events/${eventId}/refunds`,
    { params },
  );

// ── 이미지 업로드 ───────────────────────────────────────────────────────────────
export const uploadEventImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<ApiResponse<{ imageUrl: string }>>(
    "/seller/images/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
};
export const recommendEvents = () =>
    apiClient.get('/events/user/recommendations');
