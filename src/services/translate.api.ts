import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export const apiTranSlation = async (text: string) => {
  const result = await api.post<BaseResponse<{ url: string }>>(
    '/public/v1/google-translate/free/text-to-speech',
    { text, language: 'en' }
  )
  return result.data
}
