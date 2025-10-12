import api from '../lib/api'

export interface WordDefinition {
  word: string
  partOfSpeech: string
  definition: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
  pronunciation?: string
}

export interface WordResult {
  word: string
  pronunciation?: string
  audioUrl?: string
  definitions: WordDefinition[]
  frequency?: number
  synonyms?: string[]
  antonyms?: string[]
  syllables?: {
    count: number
    list: string[]
  }
}

export interface DictionaryResponse<T> {
  data: T
  message: string
  statusCode: number
}

class DictionaryAPI {
  private baseUrl = '/private/v1/dictionary'

  async lookupWord(word: string): Promise<WordResult> {
    const response = await api.get<DictionaryResponse<WordResult>>(
      `${this.baseUrl}/lookup/${encodeURIComponent(word)}`
    )
    return response.data.data
  }

  async getSuggestions(query: string, limit = 10): Promise<string[]> {
    const response = await api.get<
      DictionaryResponse<{ suggestions: string[] }>
    >(`${this.baseUrl}/suggestions`, { params: { q: query, limit } })
    return response.data.data.suggestions
  }

  async getRhymes(word: string): Promise<string[]> {
    const response = await api.get<DictionaryResponse<{ rhymes: string[] }>>(
      `${this.baseUrl}/rhymes/${encodeURIComponent(word)}`
    )
    return response.data.data.rhymes
  }

  async getRecentSearches(limit = 10): Promise<string[]> {
    const response = await api.get<DictionaryResponse<{ words: string[] }>>(
      `${this.baseUrl}/recent`,
      { params: { limit } }
    )
    return response.data.data.words
  }

  async getWordOfTheDay(): Promise<WordResult> {
    const response = await api.get<DictionaryResponse<WordResult>>(
      `${this.baseUrl}/word-of-the-day`
    )
    return response.data.data
  }
}

export const dictionaryAPI = new DictionaryAPI()
