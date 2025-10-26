import { useMutation } from '@tanstack/react-query'
import { BookOpen, Loader2, Save } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  translateText,
  type TranslateTextResponse,
} from '../../services/translate.api'
import { vocabularyAPI } from '../../services/vocabulary.api'

type TextInteractionWrapperProps = {
  children: React.ReactNode
}

const CustomToast = ({
  data,
  t,
  onSaveWord,
  isSaving,
}: {
  data: TranslateTextResponse
  t: any
  onSaveWord: () => void
  isSaving: boolean
}) => (
  <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
  >
    <div className="flex-1 w-0 p-4">
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {data.text} ({data.pronunciation})
          </p>
          {data.definitions.map((def, index) => (
            <div key={index} className="mt-1">
              <p className="text-sm text-gray-500">
                <em>{def.partOfSpeech}</em>
              </p>
              <ul className="list-disc list-inside">
                {def.definitions.map((d, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {d.definition}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex flex-col border-l border-gray-200">
      <button
        onClick={onSaveWord}
        disabled={isSaving}
        className="flex-1 border-b border-gray-200 rounded-none p-3 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        title="Lưu từ vào từ điển của bạn"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-1 border border-transparent rounded-none rounded-br-lg p-3 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)

const TextInteractionWrapper: React.FC<TextInteractionWrapperProps> = ({
  children,
}) => {
  const [selectedText, setSelectedText] = useState('')
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  const saveWordMutation = useMutation({
    mutationFn: (word: string) => vocabularyAPI.saveWord(word),
    onSuccess: () => {
      toast.success('Đã lưu từ vào từ điển của bạn!', {
        duration: 2000,
      })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể lưu từ.'
      toast.error(message)
    },
  })

  const translateMutation = useMutation({
    mutationFn: (text: string) => translateText(text),
    onSuccess: (response) => {
      const data = response.data
      toast.custom(
        (t) => (
          <CustomToast
            data={data}
            t={t}
            onSaveWord={() => saveWordMutation.mutate(data.text)}
            isSaving={saveWordMutation.isPending}
          />
        ),
        {
          duration: 6000,
        }
      )
    },
    onError: () => {
      toast.error('Could not translate the selected text.')
    },
  })

  const handleMouseUp = useCallback(() => {
    const text = window.getSelection()?.toString().trim() ?? ''
    if (text) {
      setSelectedText(text)
    }
  }, [])

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (selectedText) {
        event.preventDefault()
        setMenuPosition({ x: event.clientX, y: event.clientY })
        setMenuVisible(true)
      }
    },
    [selectedText]
  )

  const handleTranslate = () => {
    if (selectedText) {
      translateMutation.mutate(selectedText)
    }
    setMenuVisible(false)
  }

  const handleClickOutside = useCallback(() => {
    if (menuVisible) {
      setMenuVisible(false)
    }
  }, [menuVisible])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <div
      ref={wrapperRef}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{ position: 'relative' }}
    >
      {children}
      {menuVisible && (
        <div
          style={{
            position: 'fixed',
            top: menuPosition.y,
            left: menuPosition.x,
            zIndex: 1000,
          }}
          className="bg-white shadow-md rounded-md border border-gray-200"
        >
          <button
            onClick={handleTranslate}
            disabled={translateMutation.isPending}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {translateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="mr-2 h-4 w-4" />
            )}
            Translate "{selectedText.substring(0, 20)}..."
          </button>
        </div>
      )}
    </div>
  )
}

export default TextInteractionWrapper
