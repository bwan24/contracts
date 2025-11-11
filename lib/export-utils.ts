import type { Contract, RiskPoint, AuditRule } from "./types"

// 导出风险审核报告为JSON
export function exportRiskReportJSON(contract: Contract, risks: RiskPoint[]) {
  const report = {
    contract: {
      name: contract.name,
      type: contract.type,
      uploadDate: contract.uploadDate,
      standard: contract.standard,
    },
    summary: {
      totalRisks: risks.length,
      highRisks: risks.filter((r) => r.level === "high").length,
      mediumRisks: risks.filter((r) => r.level === "medium").length,
      lowRisks: risks.filter((r) => r.level === "low").length,
    },
    risks: risks.map((risk) => ({
      level: risk.level,
      type: risk.riskType,
      category: risk.category,
      description: risk.description,
      location: risk.location,
      suggestion: risk.suggestion,
    })),
    exportDate: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${contract.name}-风险报告-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 导出风险审核报告为CSV
export function exportRiskReportCSV(contract: Contract, risks: RiskPoint[]) {
  const headers = ["风险等级", "风险类型", "类别", "风险描述", "位置", "整改建议"]
  const rows = risks.map((risk) => [
    risk.level === "high" ? "高风险" : risk.level === "medium" ? "中风险" : "低风险",
    risk.riskType === "commercial" ? "商务风险" : risk.riskType === "legal" ? "法务风险" : "技术风险",
    risk.category,
    risk.description,
    risk.location,
    risk.suggestion,
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${contract.name}-风险报告-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 导出审核规则为Excel格式（CSV）
export function exportRulesCSV(rules: AuditRule[]) {
  const headers = ["规则类别", "规则名称", "标准约定", "风险等级", "规则描述", "适用合同类型"]
  const rows = rules.map((rule) => [
    rule.category,
    rule.name,
    rule.standard,
    rule.level === "high" ? "高风险" : rule.level === "medium" ? "中风险" : "低风险",
    rule.description,
    rule.contractTypes.map((t) => (t === "wind-turbine" ? "风机" : "储能")).join("、"),
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `审核规则-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 生成风险报告摘要文本
export function generateRiskSummary(contract: Contract, risks: RiskPoint[]): string {
  const highRisks = risks.filter((r) => r.level === "high")
  const mediumRisks = risks.filter((r) => r.level === "medium")
  const lowRisks = risks.filter((r) => r.level === "low")

  let summary = `【合同风险审核报告】\n\n`
  summary += `合同名称：${contract.name}\n`
  summary += `合同类型：${contract.type === "wind-turbine" ? "风机合同" : "储能合同"}\n`
  summary += `审核日期：${new Date().toLocaleDateString("zh-CN")}\n\n`
  summary += `【风险统计】\n`
  summary += `总风险数：${risks.length} 项\n`
  summary += `- 高风险：${highRisks.length} 项\n`
  summary += `- 中风险：${mediumRisks.length} 项\n`
  summary += `- 低风险：${lowRisks.length} 项\n\n`

  if (highRisks.length > 0) {
    summary += `【高风险项】\n`
    highRisks.forEach((risk, index) => {
      summary += `${index + 1}. ${risk.category} - ${risk.description}\n`
      summary += `   位置：${risk.location}\n`
      summary += `   建议：${risk.suggestion}\n\n`
    })
  }

  summary += `【审核结论】\n`
  if (highRisks.length > 0) {
    summary += `该合同存在 ${highRisks.length} 项高风险，建议重点关注并及时整改。`
  } else if (mediumRisks.length > 0) {
    summary += `该合同存在 ${mediumRisks.length} 项中风险，建议评估后进行适当调整。`
  } else {
    summary += `该合同风险较低，可以正常执行。`
  }

  return summary
}
