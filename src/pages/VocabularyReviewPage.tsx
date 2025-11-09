import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { VocabularyReviewSession } from '../components/vocabulary'

const VocabularyReviewPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>()
  const [searchParams] = useSearchParams()
  const unitId = searchParams.get('unitId') || undefined

  const defaultBackUrl = listId
    ? `/vocabulary/lists/${listId}`
    : '/vocabulary/my-lists'
  const backLabel = listId ? 'Back' : 'Back to My Vocabulary'

  return (
    <VocabularyReviewSession
      listId={listId}
      unitId={unitId}
      defaultBackUrl={defaultBackUrl}
      backLabel={backLabel}
    />
  )
}

export default VocabularyReviewPage
