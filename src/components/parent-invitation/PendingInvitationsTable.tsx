import React from 'react'
import {
  usePendingInvitations,
  useCancelInvitation,
} from '../../hooks/parent.queries'

export const PendingInvitationsTable: React.FC = () => {
  const { data: invitations, isLoading } = usePendingInvitations()
  const { mutate: cancelInvitation } = useCancelInvitation()

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      cancelInvitation(id)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getExpiryStatus = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursLeft < 0) return { text: 'Expired', color: 'text-red-600' }
    if (hoursLeft < 24)
      return {
        text: `${Math.floor(hoursLeft)}h left`,
        color: 'text-orange-600',
      }
    return { text: formatDate(expiresAt), color: 'text-gray-600' }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading invitations...</div>
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">No pending invitations</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Parent Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Expires
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invitations.map((inv) => {
            const expiry = getExpiryStatus(inv.expiresAt)
            return (
              <tr key={inv.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inv.invitedEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                  {inv.invitationCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(inv.requestedAt)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${expiry.color}`}
                >
                  {expiry.text}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleCancel(inv.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
