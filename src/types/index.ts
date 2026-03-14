export type SubmissionStatus = 'draft' | 'pending' | 'under_review' | 'approved'
export type CompanyType = 'mei' | 'ltda' | 'slu'

export interface Partner {
  id: string
  name: string
  cpf: string
  rg: string
  address: string
  sharePercentage: number
}

export interface CompanyData {
  type: CompanyType
  tradeName: string
  email: string
  phone: string
  zipCode: string
  suggestedName1: string
  suggestedName2: string
  suggestedName3: string
  capitalSocial: number
}

export interface ActivityData {
  mainCnae: string
  secondaryCnaes: string
  businessAddress: string
  description: string
}

export interface DocumentItem {
  id: string
  label: string
  fileName?: string
  uploadedAt?: string
}

export interface Submission {
  id: string
  protocol: string
  clientName: string
  status: SubmissionStatus
  createdAt: string
  updatedAt: string
  company: CompanyData
  partners: Partner[]
  activity: ActivityData
  documents: DocumentItem[]
  signature?: string
}

export type PartialSubmission = Partial<Submission>

export interface AdminUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role?: 'admin' | 'colaborador'
  createdAt: string
  twoFactorEnabled?: boolean
}

export interface AccessLog {
  id: string
  userId: string
  userEmail: string
  timestamp: string
  device: string
  browser: string
  status: 'success' | 'failed'
}

export interface ActiveSession {
  id: string
  userId: string
  device: string
  browser: string
  lastActive: string
}
