// Certificate Template Types
export enum CertificateRequirementType {
  COURSE_COMPLETION = 'course_completion',
  SCORE_BASED = 'score_based',
  COMBINED = 'combined',
}

export interface CertificateLayout {
  template: string
  background: {
    type: string
    color: string
  }
  border: {
    enabled: boolean
    style: string
    color: string
    width: number
  }
  header: {
    logo: {
      enabled: boolean
      position: string
    }
    title: {
      fontSize: number
      fontFamily: string
      color: string
      fontWeight: string
    }
  }
  body: {
    studentName: {
      fontSize: number
      fontFamily: string
      color: string
      fontWeight: string
      transform: string
    }
    courseName: {
      fontSize: number
      fontFamily: string
      color: string
      fontStyle: string
    }
  }
  footer: {
    signature: {
      enabled: boolean
      position: string
    }
    qrCode: {
      enabled: boolean
      size: number
      position: string
    }
  }
}

export interface CertificateTemplate {
  id: string
  courseId: string
  title: string
  description?: string
  layout?: CertificateLayout
  issuerName: string
  issuerTitle?: string
  issuerSignature?: string
  logoUrl?: string
  requirementType: CertificateRequirementType
  minScore?: number
  minProgress: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  course?: {
    id: string
    title: string
    description?: string
  }
}

// Issued Certificate Types
export interface IssuedCertificate {
  id: string
  certificateNumber: string
  verificationCode: string
  templateId: string
  studentId: string
  courseId: string
  classroomId?: string
  studentName: string
  studentEmail: string
  courseName: string
  courseDescription?: string
  completionDate: string
  finalScore?: number
  progress: number
  totalHours?: number
  issueDate: string
  expiryDate?: string
  verifiedAt?: string
  isRevoked: boolean
  revokedAt?: string
  revokedReason?: string
  metadata?: any
  createdAt: string
  updatedAt: string
  template?: CertificateTemplate
  student?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    displayName?: string
    avatarUrl?: string
  }
  course?: {
    id: string
    title: string
    imageUrl?: string
  }
  classroom?: {
    id: string
    name: string
    classCode: string
  }
}

// API Request/Response Types
export interface GetMyCertificatesParams {
  skip?: number
  take?: number
}

export interface GetMyCertificatesResponse {
  data: IssuedCertificate[]
  total: number
}

export interface VerifyCertificateResponse {
  success: boolean
  certificate?: IssuedCertificate
  message?: string
}

// Certificate Progress Types
export interface CertificateProgress {
  courseId: string
  courseName: string
  completionPercentage: number
  averageScore?: number
  isEligible: boolean
  requirementsMet: {
    progress: boolean
    score: boolean
  }
  template?: CertificateTemplate
}
