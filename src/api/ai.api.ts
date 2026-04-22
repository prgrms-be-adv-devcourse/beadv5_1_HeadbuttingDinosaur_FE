import { apiClient, ApiResponse } from './client'
import type { RecommendationRequest, RecommendationResponse } from './types'

export const recommendByUserVector = (body: RecommendationRequest) =>
  apiClient.post<ApiResponse<RecommendationResponse> | RecommendationResponse>('/internal/ai/recommendation', body)
