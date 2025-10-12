import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { vocabularyAPI } from '../services/vocabulary.api'

export const useSavedWords = () => {
  return useQuery({
    queryKey: ['vocabulary', 'saved'],
    queryFn: () => vocabularyAPI.getSavedWords(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSaveWord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (word: string) => vocabularyAPI.saveWord(word),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'saved'] })
      toast.success(`Đã lưu từ "${data.word}"`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể lưu từ'
      toast.error(message)
    },
  })
}

export const useDeleteWord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (word: string) => vocabularyAPI.deleteWord(word),
    onSuccess: (_, word) => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'saved'] })
      toast.success(`Đã xóa từ "${word}"`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể xóa từ'
      toast.error(message)
    },
  })
}

export const useIsWordSaved = (word: string) => {
  const { data: savedWords = [] } = useSavedWords()
  return savedWords.some(
    (saved) => saved.word.toLowerCase() === word.toLowerCase()
  )
}
