import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { dictionaryAPI, type WordResult } from '../services/dictionary.api'

export const useDictionaryLookup = (
  word: string,
  enabled = true
): UseQueryResult<WordResult, Error> => {
  return useQuery({
    queryKey: ['dictionary', 'lookup', word.toLowerCase()],
    queryFn: () => dictionaryAPI.lookupWord(word),
    enabled: enabled && !!word,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })
}

export const useDictionarySuggestions = (
  query: string,
  enabled = true
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ['dictionary', 'suggestions', query.toLowerCase()],
    queryFn: () => dictionaryAPI.getSuggestions(query),
    enabled: enabled && query.length >= 3, // Minimum 3 chars to reduce API calls
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Only retry once on failure
  })
}

export const useDictionaryRhymes = (
  word: string
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ['dictionary', 'rhymes', word.toLowerCase()],
    queryFn: () => dictionaryAPI.getRhymes(word),
    enabled: !!word,
    staleTime: 7 * 24 * 60 * 60 * 1000,
  })
}

export const useRecentSearches = (): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ['dictionary', 'recent'],
    queryFn: () => dictionaryAPI.getRecentSearches(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useWordOfTheDay = (): UseQueryResult<WordResult, Error> => {
  return useQuery({
    queryKey: ['dictionary', 'wordOfTheDay'],
    queryFn: () => dictionaryAPI.getWordOfTheDay(),
    staleTime: 60 * 60 * 1000, // 1 hour cache
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}
