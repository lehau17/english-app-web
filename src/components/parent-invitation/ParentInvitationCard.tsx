import React, { useState } from 'react'
import { useStudentInviteParent } from '../../hooks/parent.queries'
import { InvitationCodeModal } from './InvitationCodeModal'
import type { ParentInvitation } from '../../types/parent.type'

export const ParentInvitationCard: React.FC = () => {
  const [email, setEmail] = useState('')
  const [generatedInvitation, setGeneratedInvitation] =
    useState<ParentInvitation | null>(null)
  const [showCodeModal, setShowCodeModal] = useState(false)

  const { mutate: inviteParent, isPending } = useStudentInviteParent()

  const handleInvite = async () => {
    if (!email) return

    inviteParent(email, {
      onSuccess: (response) => {
        setGeneratedInvitation(response.data)
        setShowCodeModal(true)
        setEmail('') // Clear input
      },
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Invite Parent to Monitor Progress
      </h3>
      <p className="text-gray-600 mb-4">
        Enter your parent's email to send an invitation. They'll receive a code
        to link their account.
      </p>

      <div className="flex gap-3">
        <input
          type="email"
          placeholder="parent@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleInvite}
          disabled={isPending || !email}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending...' : 'Send Invitation'}
        </button>
      </div>

      {/* Invitation Code Modal */}
      {showCodeModal && generatedInvitation && (
        <InvitationCodeModal
          invitation={generatedInvitation}
          onClose={() => setShowCodeModal(false)}
        />
      )}
    </div>
  )
}
