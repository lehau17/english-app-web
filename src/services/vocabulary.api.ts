import api from '../lib/api'

export interface SavedWord {
  id: string
  userId: string
  word: string
  createdAt: string
  updatedAt: string
}

export interface VocabularyResponse<T> {
  data: T
  message: string
  statusCode: number
}

class VocabularyAPI {
  private baseUrl = '/private/v1/vocabulary'

  async saveWord(word: string): Promise<SavedWord> {
    const response = await api.post<VocabularyResponse<SavedWord>>(
      this.baseUrl,
      { word }
    )
    return response.data.data
  }

  async getSavedWords(): Promise<SavedWord[]> {
    const response = await api.get<VocabularyResponse<SavedWord[]>>(
      this.baseUrl
    )
    return response.data.data
  }

  async deleteWord(word: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${encodeURIComponent(word)}`)
  }

  async checkIfSaved(word: string, savedWords: SavedWord[]): Promise<boolean> {
    return savedWords.some(
      (saved) => saved.word.toLowerCase() === word.toLowerCase()
    )
  }
}

export const vocabularyAPI = new VocabularyAPI()
