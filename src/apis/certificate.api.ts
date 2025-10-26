import axiosInstance from '../lib/api'
import {
  type GetMyCertificatesParams,
  type GetMyCertificatesResponse,
  type IssuedCertificate,
  type VerifyCertificateResponse,
} from '../types/certificate.type'

const API_PREFIX = ''

export const certificateApi = {
  /**
   * Get my certificates (Student)
   */
  getMyCertificates: async (
    params?: GetMyCertificatesParams
  ): Promise<GetMyCertificatesResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined)
      queryParams.append('skip', params.skip.toString())
    if (params?.take !== undefined)
      queryParams.append('take', params.take.toString())

    const response = await axiosInstance.get<{
      statusCode: number
      message: string
      data: GetMyCertificatesResponse
    }>(
      `${API_PREFIX}/private/v1/certificates/my-certificates?${queryParams.toString()}`
    )
    // API returns { statusCode, message, data: { data: [], total: 0 } }
    // response.data = { statusCode, message, data: { data: [], total: 0 } }
    // response.data.data = { data: [], total: 0 }
    return response.data.data
  },

  /**
   * Get certificate by ID
   */
  getCertificateById: async (id: string): Promise<IssuedCertificate> => {
    const response = await axiosInstance.get(
      `${API_PREFIX}/private/v1/certificates/${id}`
    )
    return response.data
  },

  /**
   * Verify certificate by verification code (Public - no auth required)
   */
  verifyCertificateByCode: async (
    verificationCode: string
  ): Promise<VerifyCertificateResponse> => {
    try {
      const response = await axiosInstance.get(
        `${API_PREFIX}/public/v1/certificates/verify/code/${verificationCode}`
      )
      return {
        success: true,
        certificate: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Certificate not found',
      }
    }
  },

  /**
   * Verify certificate by certificate number (Public - no auth required)
   */
  verifyCertificateByNumber: async (
    certificateNumber: string
  ): Promise<VerifyCertificateResponse> => {
    try {
      const response = await axiosInstance.get(
        `${API_PREFIX}/public/v1/certificates/verify/number/${certificateNumber}`
      )
      return {
        success: true,
        certificate: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Certificate not found',
      }
    }
  },

  /**
   * Download certificate as PDF
   */
  downloadCertificate: async (certificateId: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `${API_PREFIX}/private/v1/certificates/${certificateId}/download`,
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  /**
   * Get certificate template by course ID
   */
  getCertificateTemplateByCourse: async (courseId: string) => {
    const response = await axiosInstance.get(
      `${API_PREFIX}/private/v1/certificate-templates/courses/${courseId}`
    )
    return response.data
  },
}

export default certificateApi
