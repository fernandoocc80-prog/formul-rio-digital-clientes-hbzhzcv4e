export type SubmissionStatus = 'draft' | 'submitted' | 'processing' | 'completed'
export type CompanyType = 'mei' | 'ltda'

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
