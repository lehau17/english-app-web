import api from '../lib/api'

export interface UploadResponse {
  url: string
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/public/v1/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // backend may return various shapes. Normalize to a string URL.
  // Common shapes:
  // { data: { url: '...' } }
  // { data: 'https://...' }
  // { url: 'https://...' }
  // { data: { data: { url: '...' } } } (sometimes double-wrapped)
  const body = res.data
  // helper to extract url from object recursively
  const extractUrl = (obj: any): string | undefined => {
    if (!obj) return undefined
    if (typeof obj === 'string') return obj
    if (typeof obj.url === 'string') return obj.url
    if (typeof obj.data === 'string') return obj.data
    return extractUrl(obj.data) || extractUrl(obj.body) || undefined
  }

  const url = extractUrl(body) || ''
  return url
}
