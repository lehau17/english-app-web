import React, { useState } from 'react'
import toast from 'react-hot-toast'
import type { ParentInvitation } from '../../types/parent.type'

interface Props {
  invitation: ParentInvitation
  onClose: () => void
}

export const InvitationCodeModal: React.FC<Props> = ({
  invitation,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(invitation.invitationCode)
    setCopied(true)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatExpiry = (expiresAt: string) => {
    const date = new Date(expiresAt)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invitation Sent!</h2>
          <p className="text-gray-600 mb-6">
            Share this code with your parent to link their account
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Invitation Code</p>
            <p className="text-4xl font-mono font-bold text-blue-600 tracking-widest">
              {invitation.invitationCode}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          <div className="text-sm text-gray-500">
            <p>
              Sent to:{' '}
              <span className="font-medium">{invitation.invitedEmail}</span>
            </p>
            <p>
              Expires:{' '}
              <span className="font-medium">
                {formatExpiry(invitation.expiresAt)}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 text-gray-600 hover:text-gray-800 underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
