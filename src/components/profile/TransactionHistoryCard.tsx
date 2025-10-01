import { Calendar, CheckCircle, CreditCard, XCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useTransactionHistory } from '../../hooks/payment.hooks'
import type { Transaction } from '../../services/payment.api'

interface TransactionHistoryCardProps {
  limit?: number
}

export default function TransactionHistoryCard({
  limit = 10,
}: TransactionHistoryCardProps) {
  const { data, isLoading, error } = useTransactionHistory(1, limit)

  const transactions = useMemo(() => {
    if (!data?.data?.transactions) return []
    return data.data.transactions
  }, [data])

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="h-3 w-3" />
            Thành công
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            <CreditCard className="h-3 w-3" />
            Đang xử lý
          </span>
        )
      case 'FAILED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-3 w-3" />
            {status === 'FAILED' ? 'Thất bại' : 'Đã hủy'}
          </span>
        )
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
            >
              <div className="flex-1">
                <div className="mb-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center text-sm text-red-600">
          Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            Chưa có giao dịch nào được thực hiện
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
        {data?.data?.total && data.data.total > limit && (
          <span className="text-sm text-gray-500">
            Hiển thị {transactions.length}/{data.data.total} giao dịch
          </span>
        )}
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {transaction.description || 'Thanh toán khóa học'}
                  </h4>
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(transaction.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>
                      {transaction.provider} - {transaction.vnpayOrderId}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${
                    transaction.status === 'SUCCESS'
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
