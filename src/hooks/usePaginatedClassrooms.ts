// import { useState } from 'react'
// import { useMyClassrooms } from './useMyClassrooms'

// export const usePaginatedClassrooms = (initialPage = 1, initialLimit = 10, initialKeyword = '') => {
//   const [page, setPage] = useState(initialPage)
//   const [limit, setLimit] = useState(initialLimit)
//   const [keyword, setKeyword] = useState(initialKeyword)

//   const { data, isLoading, isError, refetch } = useMyClassrooms()

//   return {
//     classrooms: data?.data || [],
//     page: data?.page || page,
//     limit: data?.limit || limit,
//     totalItems: data?.totalItems || 0,
//     totalPages: data?.totalPages || 0,
//     hasNextPage: data?.hasNextPage || false,
//     hasPrevPage: data?.hasPrevPage || false,
//     isLoading,
//     isError,
//     setPage,
//     setLimit,
//     setKeyword,
//     refetch,
//   }
// }
