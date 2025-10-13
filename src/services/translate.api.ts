import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export const apiTranSlation = async (text: string) => {
  const result = await api.post<BaseResponse<{ url: string }>>(
    '/public/v1/google-translate/free/text-to-speech',
    { text, language: 'en' }
  )
  return result.data
}

export type TranslateTextResponse = {
  text: string
  pronunciation: string
  definitions: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example: string
      synonyms: string[]
    }>
  }>
}

export const translateText = async (
  text: string
): Promise<BaseResponse<TranslateTextResponse>> => {
  const result = await api.post<BaseResponse<TranslateTextResponse>>(
    '/public/v1/google-translate/free/translate',
    { text, targetLanguage: 'vi' }
  )
  return result.data
}
