// 合同类型
export type ContractType = "wind-turbine" | "energy-storage"
export type ContractStandard = "standard" | "non-standard"

// 风险等级
export type RiskLevel = "high" | "medium" | "low"

// 合同接口
export interface Contract {
  id: string
  name: string
  type: ContractType
  standard: ContractStandard
  uploadDate: string // Now includes time with hours:minutes:seconds
  fileUrl: string
  fileSize: string // Added file size field
  status: "pending" | "analyzing" | "completed"
  riskCount?: {
    high: number
    medium: number
    low: number
  }
}

// 风险点接口
export interface RiskPoint {
  id: string
  contractId: string
  category: string
  riskType: "commercial" | "legal" | "technical"
  level: RiskLevel
  description: string
  location: string
  suggestion: string
  ruleId: string
  excerpt?: string // Added excerpt field for contract text summary
}

// 审核规则接口
export interface AuditRule {
  id: string
  category: string
  name: string
  standard: string
  level: RiskLevel
  description: string
  contractTypes: ContractType[]
  createdAt: string
  updatedAt: string
}

// 支付条款接口
export interface PaymentTerm {
  node: string
  ratio: string
  timeRegulation: string
  batch: string
  note: string
}

// 合同分析结果
export interface ContractAnalysis {
  contractId: string
  keyElements: {
    parties: string[]
    effectiveDate: string
    amount: string
    deliveryDate: string
    paymentTerms: string
  }
  paymentBreakdown: PaymentTerm[] // Added payment breakdown
  riskPoints: RiskPoint[]
  overallRiskLevel: RiskLevel
  summary: string
  contractContent: string // Added original contract content
  markdownPreview: string // Added markdown preview
}
