export type SubmissionStatus = 'draft' | 'submitted' | 'processing' | 'completed'

export interface Partner {
  id: string
  name: string
  cpf: string
  rg: string
  address: string
  sharePercentage: number
}

export interface CompanyData {
  suggestedName1: string
  suggestedName2: string
  suggestedName3: string
  capitalSocial: number
}

export interface ActivityData {
  mainCnae: string
  secondaryCnaes: string
  businessAddress: string
}

export interface Submission {
  id: string
  clientName: string
  status: SubmissionStatus
  createdAt: string
  updatedAt: string
  partners: Partner[]
  company: CompanyData
  activity: ActivityData
}

export type PartialSubmission = Partial<Submission>
