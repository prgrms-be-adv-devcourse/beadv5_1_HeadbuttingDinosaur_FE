import { apiClient, ApiResponse } from './client';
import type {
  PaymentRequest, PaymentResponse,
  PaymentConfirmRequest, PaymentConfirmResponse,
  PaymentFailRequest,
} from './types';

export const readyPayment = (body: PaymentRequest) =>
  apiClient.post<ApiResponse<PaymentResponse>>('/payments/ready', body);

export const confirmPayment = (body: PaymentConfirmRequest) =>
  apiClient.post<ApiResponse<PaymentConfirmResponse>>('/payments/confirm', body);

export const failPayment = (body: PaymentFailRequest) =>
  apiClient.post<ApiResponse<void>>('/payments/fail', body);
