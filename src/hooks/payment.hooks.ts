import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type {
  CreatePaymentRequest,
  VNPayReturnParams,
} from '../services/payment.api'
import { paymentApi } from '../services/payment.api'

// Hook for creating payment transaction
export const useCreatePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: () => {
      // Invalidate transaction history to refresh
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] })
    },
  })
}

// Hook for fetching transaction history
export const useTransactionHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['payments', 'transactions', page, limit],
    queryFn: () => paymentApi.getTransactions(page, limit),
  })
}

// Hook for checking purchase status
export const usePurchaseStatus = (classroomId?: string) => {
  return useQuery({
    queryKey: ['payments', 'purchase-status', classroomId],
    queryFn: () => paymentApi.getPurchaseStatus(classroomId!),
    enabled: !!classroomId,
  })
}

// Hook for handling VNPay return
export const useVNPayReturn = () => {
  return useMutation({
    mutationFn: (params: VNPayReturnParams) =>
      paymentApi.handleVNPayReturn(params),
  })
}

// Custom hook for payment process management
export const usePaymentProcess = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<
    'idle' | 'creating' | 'redirecting' | 'processing' | 'success' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  const createPaymentMutation = useCreatePayment()

  const initiatePayment = async (data: CreatePaymentRequest) => {
    try {
      setIsProcessing(true)
      setPaymentStep('creating')
      setError(null)

      const response = await createPaymentMutation.mutateAsync(data)

      // Check for successful response based on statusCode (200-299) or presence of paymentUrl
      if (response.data && response.data.paymentUrl) {
        setPaymentStep('redirecting')

        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl
      } else {
        throw new Error(response.message || 'Failed to create payment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment creation failed')
      setPaymentStep('error')
      setIsProcessing(false)
    }
  }

  const resetPayment = () => {
    setIsProcessing(false)
    setPaymentStep('idle')
    setError(null)
  }

  return {
    initiatePayment,
    resetPayment,
    isProcessing,
    paymentStep,
    error,
    isCreating: paymentStep === 'creating',
    isRedirecting: paymentStep === 'redirecting',
  }
}

// Hook for payment status polling (useful for checking payment completion)
export const usePaymentStatusPolling = (
  classroomId?: string,
  enabled = false
) => {
  return useQuery({
    queryKey: ['payments', 'status-poll', classroomId],
    queryFn: () => paymentApi.getPurchaseStatus(classroomId!),
    enabled: !!classroomId && enabled,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchOnWindowFocus: true,
  })
}

// Hook for VNPay return URL processing
export const useVNPayReturnHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    responseCode?: string
  } | null>(null)

  const processReturnParams = async (params: URLSearchParams) => {
    setIsProcessing(true)
    setResult(null)

    try {
      // Extract VNPay parameters from URL
      const vnpayParams: VNPayReturnParams = {
        vnp_Amount: params.get('vnp_Amount') || '0',
        vnp_BankCode: params.get('vnp_BankCode') || undefined,
        vnp_BankTranNo: params.get('vnp_BankTranNo') || undefined,
        vnp_CardType: params.get('vnp_CardType') || undefined,
        vnp_OrderInfo: params.get('vnp_OrderInfo') || '',
        vnp_PayDate: params.get('vnp_PayDate') || undefined,
        vnp_ResponseCode: params.get('vnp_ResponseCode') || '99',
        vnp_TmnCode: params.get('vnp_TmnCode') || '',
        vnp_TransactionNo: params.get('vnp_TransactionNo') || undefined,
        vnp_TransactionStatus: params.get('vnp_TransactionStatus') || undefined,
        vnp_TxnRef: params.get('vnp_TxnRef') || '',
        vnp_SecureHash: params.get('vnp_SecureHash') || '',
      }

      await paymentApi.handleVNPayReturn(vnpayParams)

      const isSuccess = paymentApi.isPaymentSuccess(
        vnpayParams.vnp_ResponseCode
      )
      const message = paymentApi.getPaymentStatusMessage(
        vnpayParams.vnp_ResponseCode
      )

      setResult({
        success: isSuccess,
        message,
        responseCode: vnpayParams.vnp_ResponseCode,
      })
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Có lỗi xảy ra khi xử lý thanh toán',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processReturnParams,
    isProcessing,
    result,
  }
}
