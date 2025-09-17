export interface PageResponse<T> {
  statusCode: number
  message: string
  data: {
    data: T[]
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
