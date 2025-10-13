import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2, BookOpen } from 'lucide-react'
import {
  translateText,
  type TranslateTextResponse,
} from '../../services/translate.api'

type TextInteractionWrapperProps = {
  children: React.ReactNode
}

const CustomToast = ({ data, t }: { data: TranslateTextResponse; t: any }) => (
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
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

  const translateMutation = useMutation({
    mutationFn: (text: string) => translateText(text),
    onSuccess: (response) => {
      const data = response.data
      toast.custom((t) => <CustomToast data={data} t={t} />, {
        duration: 6000,
      })
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

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuVisible) {
        setMenuVisible(false)
      }
    },
    [menuVisible]
  )

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
