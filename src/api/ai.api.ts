import { apiClient, ApiResponse } from './client'
import type { RecommendationResponse } from './types'

export const getEventRecommendations = () =>
  apiClient.get<ApiResponse<RecommendationResponse> | RecommendationResponse>('/events/recommendations')
