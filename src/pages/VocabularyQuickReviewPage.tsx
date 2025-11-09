import React from 'react'
import { VocabularyReviewSession } from '../components/vocabulary'

const VocabularyQuickReviewPage: React.FC = () => {
  return (
    <VocabularyReviewSession
      allowWithoutIds
      includeNew={false}
      includeReview
      limit={50}
      defaultBackUrl="/vocabulary/my-lists"
      backLabel="Back to My Vocabulary"
    />
  )
}

export default VocabularyQuickReviewPage
