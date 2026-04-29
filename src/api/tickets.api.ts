import { apiClient, ApiResponse } from './client';
import type {
  TicketListRequest, TicketListResponse,
  TicketDetailResponse,
} from './types';

export const getTickets = (params?: TicketListRequest) =>
  apiClient.get<ApiResponse<TicketListResponse>>('/tickets', { params });

export const getTicketDetail = (ticketId: string) =>
  apiClient.get<ApiResponse<TicketDetailResponse>>(`/tickets/${ticketId}`);
