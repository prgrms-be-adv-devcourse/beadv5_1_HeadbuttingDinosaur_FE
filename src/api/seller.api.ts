import { apiClient } from './client';
import type { SettlementMonthResponse } from './types';

export const getSellerSettlementByMonth = (yyyymm: string) =>
  apiClient.get<SettlementMonthResponse>(`/seller/settlements/${yyyymm}`);

export const getSellerSettlementPreview = () =>
  apiClient.get<SettlementMonthResponse>('/seller/settlements/preview');
