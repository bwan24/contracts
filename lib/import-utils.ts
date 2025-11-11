import type { AuditRule, RiskLevel, ContractType } from "./types"

// 解析CSV文件内容
export function parseCSVContent(content: string): string[][] {
  const lines = content.split("\n").filter((line) => line.trim())
  return lines.map((line) => {
    const values: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values.map((v) => v.replace(/^"|"$/g, ""))
  })
}

// 从CSV导入审核规则
export function importRulesFromCSV(content: string): AuditRule[] {
  const rows = parseCSVContent(content)
  const headers = rows[0]
  const dataRows = rows.slice(1)

  const rules: AuditRule[] = []

  dataRows.forEach((row, index) => {
    if (row.length < 6) return

    const [category, name, standard, levelStr, description, contractTypesStr] = row

    // 解析风险等级
    let level: RiskLevel = "medium"
    if (levelStr.includes("高")) level = "high"
    else if (levelStr.includes("低")) level = "low"

    // 解析合同类型
    const contractTypes: ContractType[] = []
    if (contractTypesStr.includes("风机")) contractTypes.push("wind-turbine")
    if (contractTypesStr.includes("储能")) contractTypes.push("energy-storage")

    if (contractTypes.length === 0) {
      contractTypes.push("wind-turbine", "energy-storage")
    }

    rules.push({
      id: `imported-rule-${Date.now()}-${index}`,
      category: category || "未分类",
      name: name || "未命名规则",
      standard: standard || "",
      level,
      description: description || "",
      contractTypes,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    })
  })

  return rules
}

// 生成Excel导入模板
export function generateRuleTemplate() {
  const headers = ["规则类别", "规则名称", "标准约定", "风险等级", "规则描述", "适用合同类型"]
  const exampleRows = [
    [
      "商务条款",
      "付款条件审核",
      "预付款比例不得超过30%，质保金不低于5%",
      "高风险",
      "审核合同中的付款条件是否符合公司财务政策",
      "风机、储能",
    ],
    [
      "法务条款",
      "违约责任条款",
      "必须明确违约责任及赔偿上限",
      "高风险",
      "检查违约责任条款的完整性和合理性",
      "风机、储能",
    ],
    [
      "技术条款",
      "技术参数验收标准",
      "必须包含明确的技术参数和验收标准",
      "中风险",
      "确保技术规格和验收标准清晰可执行",
      "风机",
    ],
  ]

  const csvContent = [headers.join(","), ...exampleRows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join(
    "\n",
  )

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `审核规则导入模板-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
