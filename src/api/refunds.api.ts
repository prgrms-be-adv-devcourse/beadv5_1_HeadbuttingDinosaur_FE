import { apiClient, ApiResponse } from './client';
import type {
  RefundInfoResponse,
  TicketRefundRequest, TicketRefundResponse,
  OrderRefundRequest, OrderRefundResponse,
  RefundListResponse,
  RefundDetailResponse,
} from './types';

export const getRefundInfo = (ticketId: string) =>
  apiClient.get<ApiResponse<RefundInfoResponse>>('/refunds/info', { params: { ticketId } });

export const refundTicketByPg = (ticketId: string, body: TicketRefundRequest) =>
  apiClient.post<ApiResponse<TicketRefundResponse>>(`/refunds/pg/${ticketId}`, body);

export const refundOrder = (orderId: string, body: OrderRefundRequest) =>
  apiClient.post<ApiResponse<OrderRefundResponse>>(`/refunds/orders/${orderId}`, body);

export const getRefunds = (params?: { page?: number; size?: number }) =>
  apiClient.get<RefundListResponse>('/refunds', { params });

export const getRefundDetail = (refundId: string) =>
  apiClient.get<ApiResponse<RefundDetailResponse>>(`/refunds/${refundId}`);

export const getSellerEventRefundsPage = (eventId: string, params?: { page?: number; size?: number }) =>
  apiClient.get<RefundListResponse>(`/seller/refunds/events/${eventId}`, { params });
