import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

interface SuggestionResponseDto {
  suggestions: string[]
}

export const useSuggestions = (sessionId: string) => {
  return useQuery({
    queryKey: ['suggestions', sessionId],
    queryFn: async () => {
      const response = await api.get<BaseResponse<SuggestionResponseDto>>(
        `/private/v1/ai-speaking/sessions/${sessionId}/suggestions`
      )
      return response.data.data
    },
    enabled: false,
    staleTime: 0,
    retry: 1,
  })
}
