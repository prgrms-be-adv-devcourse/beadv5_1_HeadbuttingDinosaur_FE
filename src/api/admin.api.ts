import { apiClient, ApiResponse } from './client';
import type {
  AdminDashboardResponse,
  AdminEventSearchRequest, AdminEventListResponse,
  EventCancelResponse,
  UserSearchCondition, UserListResponse,
  AdminUserDetailResponse,
  UserStatusRequest, UserStatusResponse,
  UserRoleRequest, UserRoleResponse,
  SellerApplicationListResponse,
  AdminSettlementListResponse, AdminSettlementSearchRequest, AdminSettlementDetailResponse,
  AdminTechStackItem,
} from './types';

// ── 대시보드 ───────────────────────────────────────────────────────────────────
export const getAdminDashboard = () =>
  apiClient.get<ApiResponse<AdminDashboardResponse>>('/admin/dashboard');

// ── 이벤트 관리 ────────────────────────────────────────────────────────────────
export const getAdminEvents = (params?: AdminEventSearchRequest) =>
  apiClient.get<ApiResponse<AdminEventListResponse>>('/admin/events', { params });

export const forcecancelEvent = (eventId: string) =>
  apiClient.patch<ApiResponse<EventCancelResponse>>(`/admin/events/${eventId}/force-cancel`);

// ── 회원 관리 ──────────────────────────────────────────────────────────────────
export const getAdminUsers = (params?: UserSearchCondition) =>
  apiClient.get<ApiResponse<UserListResponse>>('/admin/users', { params });

export const getAdminUserDetail = (userId: string) =>
  apiClient.get<ApiResponse<AdminUserDetailResponse>>(`/admin/users/${userId}`);

export const updateUserStatus = (userId: string, body: UserStatusRequest) =>
  apiClient.patch<ApiResponse<UserStatusResponse>>(`/admin/users/${userId}/status`, body);

export const updateUserRole = (userId: string, body: UserRoleRequest) =>
  apiClient.patch<ApiResponse<UserRoleResponse>>(`/admin/users/${userId}/role`, body);

// ── 판매자 신청 ────────────────────────────────────────────────────────────────
export const getSellerApplications = () =>
    apiClient.get<SellerApplicationListResponse[]>('/admin/seller-applications');

export const processSellerApplication = (applicationId: string, decision: string) =>
    apiClient.patch(`/admin/seller-applications/${applicationId}`, { decision });

// ── 정산 ───────────────────────────────────────────────────────────────────────
export const runSettlementProcess = () =>
  apiClient.post('/admin/settlements/run');

export const getAdminSettlements = (params?: AdminSettlementSearchRequest) =>
  apiClient.get<AdminSettlementListResponse>('/admin/settlements', { params });

export const getAdminSettlementDetail = (settlementId: string) =>
  apiClient.get<AdminSettlementDetailResponse>(`/admin/settlements/${settlementId}`);

export const cancelSettlement = (settlementId: string) =>
  apiClient.post(`/admin/settlements/${settlementId}/cancel`);

export const paySettlement = (settlementId: string) =>
  apiClient.post(`/admin/settlements/${settlementId}/payment`);

// ── 수수료 정책 ────────────────────────────────────────────────────────────────
export const getFeePolicies = () =>
  apiClient.get('/admin/fee-policies');

export const createFeePolicy = (body: unknown) =>
  apiClient.post('/admin/fee-policies', body);

export const updateFeePolicy = (policyId: string, body: unknown) =>
  apiClient.patch(`/admin/fee-policies/${policyId}`, body);

// ── 기술 스택 관리 ──────────────────────────────────────────────────────────────
export const getAdminTechStacks = () =>
  apiClient.get<AdminTechStackItem[]>('/admin/techstacks');

export const createAdminTechStack = (name: string) =>
  apiClient.post<AdminTechStackItem>('/admin/techstacks', { name });

export const updateAdminTechStack = (id: number, name: string) =>
  apiClient.put<AdminTechStackItem>(`/admin/techstacks/${id}`, { name });

export const deleteAdminTechStack = (id: number) =>
  apiClient.delete(`/admin/techstacks/${id}`);
