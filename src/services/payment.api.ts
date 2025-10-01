import api from '../lib/api'

// Payment-related types
export interface CreatePaymentRequest {
  classroomId: string
  courseId: string
  amount: number
  description?: string
  studentId?: string // Cần thêm studentId khi phụ huynh thực hiện thanh toán
}

export interface CreatePaymentResponse {
  statusCode: number
  message: string
  data: {
    id: string
    paymentUrl: string
    amount: number
    currency: string
    status: string
    provider: string
    type: string
    transactionId: string
    orderId: string
    vnpayTxnRef: string
    createdAt: string
  }
}

export interface Transaction {
  id: string
  userId: string
  classroomId: string
  amount: number
  description: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  provider: 'VNPAY'
  type: 'PAYMENT'
  vnpayOrderId: string
  vnpayTransactionNo?: string
  vnpayResponseCode?: string
  vnpaySecureHash?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionHistoryResponse {
  success: boolean
  data: {
    transactions: Transaction[]
    total: number
    page: number
    limit: number
  }
  message: string
}

export interface PurchaseStatusResponse {
  success: boolean
  data: {
    isPurchased: boolean
    transactionId?: string
    paidAt?: string
  }
  message: string
}

export interface VNPayReturnParams {
  vnp_Amount: string
  vnp_BankCode?: string
  vnp_BankTranNo?: string
  vnp_CardType?: string
  vnp_OrderInfo: string
  vnp_PayDate?: string
  vnp_ResponseCode: string
  vnp_TmnCode: string
  vnp_TransactionNo?: string
  vnp_TransactionStatus?: string
  vnp_TxnRef: string
  vnp_SecureHash: string
}

// Payment API service
export const paymentApi = {
  // Create payment transaction
  createPayment: async (
    data: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> => {
    const response = await api.post('/private/v1/payment/create', data)
    return response.data
  },

  // Get user transaction history
  getTransactions: async (
    page = 1,
    limit = 10
  ): Promise<TransactionHistoryResponse> => {
    const response = await api.get('/private/v1/payment/transactions', {
      params: { page, limit },
    })
    return response.data
  },

  // Check purchase status for a classroom
  getPurchaseStatus: async (
    classroomId: string
  ): Promise<PurchaseStatusResponse> => {
    const response = await api.get(
      `/private/v1/payment/purchase-status/${classroomId}`
    )
    return response.data
  },

  // Handle VNPay return (called by webhook, but can be used for status checking)
  handleVNPayReturn: async (params: VNPayReturnParams) => {
    const response = await api.get('/public/v1/payment/vnpay/return', {
      params,
    })
    return response.data
  },

  // Utility: Check if response code indicates success
  isPaymentSuccess: (responseCode: string): boolean => {
    return responseCode === '00'
  },

  // Utility: Get payment status message in Vietnamese
  getPaymentStatusMessage: (responseCode: string): string => {
    const messages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    }
    return messages[responseCode] || 'Lỗi không xác định'
  },
}
