import type { Contract, AuditRule, RiskPoint, ContractAnalysis, PaymentTerm } from "./types"

export const mockContracts: Contract[] = [
  {
    id: "1",
    name: "海上风电3.5MW机组采购合同",
    type: "wind-turbine",
    standard: "standard",
    uploadDate: "2025-10-13T15:52:07",
    fileUrl: "/contracts/contract-001.pdf",
    fileSize: "2.9 MB",
    status: "completed",
    riskCount: { high: 2, medium: 5, low: 3 },
  },
  {
    id: "7",
    name: "12.docx",
    type: "wind-turbine",
    standard: "standard",
    uploadDate: "2025-10-15T10:20:00",
    fileUrl: "/contracts/12.docx",
    fileSize: "1.8 MB",
    status: "completed",
    riskCount: { high: 1, medium: 3, low: 2 },
  },
  {
    id: "2",
    name: "陆上风机EN-156标准合同",
    type: "wind-turbine",
    standard: "standard",
    uploadDate: "2025-10-13T15:52:05",
    fileUrl: "/contracts/contract-002.pdf",
    fileSize: "1.4 MB",
    status: "completed",
    riskCount: { high: 1, medium: 3, low: 2 },
  },
  {
    id: "3",
    name: "储能电池系统非标采购协议",
    type: "energy-storage",
    standard: "non-standard",
    uploadDate: "2025-10-13T15:52:03",
    fileUrl: "/contracts/contract-003.pdf",
    fileSize: "1.2 MB",
    status: "completed",
    riskCount: { high: 0, medium: 2, low: 1 },
  },
  {
    id: "4",
    name: "分布式储能柜采购合同",
    type: "energy-storage",
    standard: "non-standard",
    uploadDate: "2025-10-13T15:52:00",
    fileUrl: "/contracts/contract-004.pdf",
    fileSize: "3.1 MB",
    status: "completed",
    riskCount: { high: 1, medium: 4, low: 2 },
  },
  {
    id: "5",
    name: "风机叶片维护服务合同",
    type: "wind-turbine",
    standard: "non-standard",
    uploadDate: "2025-10-13T15:51:59",
    fileUrl: "/contracts/contract-005.pdf",
    fileSize: "2.0 MB",
    status: "completed",
    riskCount: { high: 0, medium: 1, low: 0 },
  },
  {
    id: "6",
    name: "大型储能电站EPC总包合同",
    type: "energy-storage",
    standard: "standard",
    uploadDate: "2025-10-13T15:51:57",
    fileUrl: "/contracts/contract-006.pdf",
    fileSize: "4.2 MB",
    status: "completed",
    riskCount: { high: 3, medium: 6, low: 4 },
  },
]

export const mockAuditRules: AuditRule[] = [
  {
    id: "rule-1",
    category: "商务条款",
    name: "付款条件审核",
    standard: "预付款比例不得超过30%，质保金不低于5%",
    level: "high",
    description: "审核合同中的付款条件是否符合公司财务政策",
    contractTypes: ["wind-turbine", "energy-storage"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "rule-2",
    category: "法务条款",
    name: "违约责任条款",
    standard: "必须明确违约责任及赔偿上限",
    level: "high",
    description: "检查违约责任条款的完整性和合理性",
    contractTypes: ["wind-turbine", "energy-storage"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "rule-3",
    category: "技术条款",
    name: "技术参数验收标准",
    standard: "必须包含明确的技术参数和验收标准",
    level: "medium",
    description: "确保技术规格和验收标准清晰可执行",
    contractTypes: ["wind-turbine"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "rule-4",
    category: "商务条款",
    name: "交付期限",
    standard: "交付期限应明确具体日期，延期罚则应量化",
    level: "medium",
    description: "审核交付时间和延期责任条款",
    contractTypes: ["wind-turbine", "energy-storage"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "rule-5",
    category: "法务条款",
    name: "知识产权归属",
    standard: "必须明确知识产权归属和使用权限",
    level: "low",
    description: "检查知识产权相关条款的完整性",
    contractTypes: ["wind-turbine", "energy-storage"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
]

export const mockRiskPoints: RiskPoint[] = [
  {
    id: "risk-1",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "high",
    description: "付款条件",
    location: "第三条 付款方式 第1款",
    suggestion: "建议将预付款比例调整至30%以内，或增加相应的履约保函",
    ruleId: "rule-1",
    excerpt: "合同签订后7日内，甲方支付合同总额的35%作为预付款。预付款用于设备采购和生产准备。",
  },
  {
    id: "risk-2",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "high",
    description: "付款比例",
    location: "第三条 付款方式",
    suggestion: "建议调整付款比例结构，确保预付款+投料款不超过合同总价的20%，以降低资金风险",
    ruleId: "rule-1",
    excerpt: "预付款35%加上投料款20%，合计占合同总价的55%，远超公司规定的前期付款20%上限。",
  },
  {
    id: "risk-3",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "medium",
    description: "付款计划",
    location: "第三条 付款方式 第2-4款",
    suggestion: "付款计划整体合理，建议明确各阶段付款的前置条件和验收标准",
    ruleId: "rule-1",
    excerpt: "进度款30%在设备到货后支付，验收款30%在验收合格后支付，质保金5%在质保期满后支付。",
  },
  {
    id: "risk-4",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "high",
    description: "总金额",
    location: "第二条 合同金额",
    suggestion: "建议明确合同总金额是否包含税费、运输费、安装调试费等，避免后期争议",
    ruleId: "rule-1",
    excerpt: "合同总金额为人民币壹仟伍佰万元整（¥15,000,000），但未明确说明该金额是否含税及其他费用。",
  },
  {
    id: "risk-5",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "high",
    description: "比例风险：预付款 + 投料款 < 合同总价 20%",
    location: "第三条 付款方式",
    suggestion: "当前预付款35%+投料款20%=55%，严重超标。建议调整为：预付款10%+投料款10%=20%",
    ruleId: "rule-1",
    excerpt: "预付款比例35%，投料款比例20%，两项合计55%，不符合公司财务风控要求（前期付款不超过20%）。",
  },
  {
    id: "risk-6",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "medium",
    description: "比例风险: 预付款 + 投料款 + 到货款 < 合同总价 70%",
    location: "第三条 付款方式",
    suggestion: "当前三项合计85%，建议调整到货款比例至15%，使三项合计不超过70%",
    ruleId: "rule-1",
    excerpt: "预付款35%+投料款20%+到货款30%=85%，超过公司规定的验收前付款70%上限，存在较大资金风险。",
  },
  {
    id: "risk-7",
    contractId: "1",
    category: "付款",
    riskType: "commercial",
    level: "medium",
    description: "质量保证金风险: 存在质量保证金",
    location: "第三条 付款方式 第4款",
    suggestion: "质保金比例仅5%，低于公司规定的10%标准，建议提高至10%以确保质量保障",
    ruleId: "rule-1",
    excerpt: "质保金：质保期满后支付5%。质保期为设备验收合格后5年。",
  },
  {
    id: "risk-8",
    contractId: "1",
    category: "保修SLA",
    riskType: "technical",
    level: "medium",
    description: "到场服务窗口",
    location: "第六条 质量保证 第3款",
    suggestion: "建议明确故障响应时间为4小时内，到场服务时间为24小时内，确保及时维护",
    ruleId: "rule-3",
    excerpt: "质保期内出现故障，乙方应及时响应并提供维修服务，但未明确具体的响应时间和到场时间要求。",
  },
  {
    id: "risk-9",
    contractId: "1",
    category: "保修SLA",
    riskType: "technical",
    level: "low",
    description: "响应时间",
    location: "第六条 质量保证 第3款",
    suggestion: "建议补充7×24小时服务热线和远程诊断支持条款",
    ruleId: "rule-3",
    excerpt: "乙方承诺在接到故障通知后4小时内响应，24小时内到达现场进行维修。",
  },
  {
    id: "risk-10",
    contractId: "2",
    category: "付款",
    riskType: "commercial",
    level: "medium",
    description: "付款条件",
    location: "第三条 付款方式",
    suggestion: "建议增加付款条件的明确约定，包括发票提供时间和付款审批流程",
    ruleId: "rule-1",
    excerpt: "合同约定分期付款，但未明确每期付款的具体条件和所需提供的单据清单。",
  },
  {
    id: "risk-11",
    contractId: "2",
    category: "法务条款",
    riskType: "legal",
    level: "high",
    description: "违约责任条款中未明确赔偿上限",
    location: "第八条 违约责任 第3款",
    suggestion: "建议增加违约赔偿上限条款，建议设定为合同总额的20%",
    ruleId: "rule-2",
    excerpt: "任何一方违约应承担违约责任，向守约方支付违约金，但未明确违约金的计算方式和赔偿上限。",
  },
]

export const mockPaymentTerms: PaymentTerm[] = [
  {
    node: "预付款",
    ratio: "10%",
    timeRegulation: "(合同签订后由卖方提交预付款财务收据)",
    batch: "",
    note: "",
  },
  {
    node: "投料款",
    ratio: "20% (该批设备价格)",
    timeRegulation: "(第一批设备交货前 2 个月，卖方提交投料款财务收据单据后 15 日内)",
    batch: "按批次",
    note: "",
  },
  {
    node: "到货款",
    ratio: "50% (该批设备价格)",
    timeRegulation: "(每一批设备 (不超过四台) 车板交货后一周内，卖方提交到货款的财务收据日核对无误后 15 日内)",
    batch: "按批次",
    note: "",
  },
  {
    node: "预验收款",
    ratio: "10% (批设备价格)",
    timeRegulation:
      "(每批 (不超过四台) 合同设备安装调试并通过 240 小时试运行后，买方收到卖方提交的预验收款的财务收据日核对无误后 15 日内)",
    batch: "按批次",
    note: "",
  },
  {
    node: "验收款",
    ratio: "10%",
    timeRegulation:
      "(全部机组设备安装调试并通过 240 小时试运行后，买方收到卖方提交的验收款的财务收据日核对无误后 15 日内)",
    batch: "",
    note: "",
  },
  {
    node: "质量保证金",
    ratio: "10%",
    timeRegulation:
      "(买方在全部机组通过 240 小时试运行后提供合同总价的 10%的设备质量保证函，有效期至签署预验收证书之日起 5 年，有效期结束后 30 日内，买方应将相应保函退还至卖方)",
    batch: "",
    note: "",
  },
]

export const mockContractAnalysis: Record<string, ContractAnalysis> = {
  "1": {
    contractId: "1",
    keyElements: {
      parties: ["远景能源有限公司", "某风电开发有限公司"],
      effectiveDate: "2025-03-28",
      amount: "¥15,000,000",
      deliveryDate: "2025-12-31",
      paymentTerms: "分期付款",
    },
    paymentBreakdown: mockPaymentTerms,
    riskPoints: [
      {
        id: "risk-1",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "high",
        description: "付款条件",
        location: "第三条 付款方式 第1款",
        suggestion: "建议将预付款比例调整至30%以内，或增加相应的履约保函",
        ruleId: "rule-1",
        excerpt: "合同签订后7日内，甲方支付合同总额的35%作为预付款。预付款用于设备采购和生产准备。",
      },
      {
        id: "risk-2",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "high",
        description: "付款比例",
        location: "第三条 付款方式",
        suggestion: "建议调整付款比例结构，确保预付款+投料款不超过合同总价的20%，以降低资金风险",
        ruleId: "rule-1",
        excerpt: "预付款35%加上投料款20%，合计占合同总价的55%，远超公司规定的前期付款20%上限。",
      },
      {
        id: "risk-3",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "medium",
        description: "付款计划",
        location: "第三条 付款方式 第2-4款",
        suggestion: "付款计划整体合理，建议明确各阶段付款的前置条件和验收标准",
        ruleId: "rule-1",
        excerpt: "进度款30%在设备到货后支付，验收款30%在验收合格后支付，质保金5%在质保期满后支付。",
      },
      {
        id: "risk-4",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "high",
        description: "总金额",
        location: "第二条 合同金额",
        suggestion: "建议明确合同总金额是否包含税费、运输费、安装调试费等，避免后期争议",
        ruleId: "rule-1",
        excerpt: "合同总金额为人民币壹仟伍佰万元整（¥15,000,000），但未明确说明该金额是否含税及其他费用。",
      },
      {
        id: "risk-5",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "high",
        description: "比例风险：预付款 + 投料款 < 合同总价 20%",
        location: "第三条 付款方式",
        suggestion: "当前预付款35%+投料款20%=55%，严重超标。建议调整为：预付款10%+投料款10%=20%",
        ruleId: "rule-1",
        excerpt: "预付款比例35%，投料款比例20%，两项合计55%，不符合公司财务风控要求（前期付款不超过20%）。",
      },
      {
        id: "risk-6",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "medium",
        description: "比例风险: 预付款 + 投料款 + 到货款 < 合同总价 70%",
        location: "第三条 付款方式",
        suggestion: "当前三项合计85%，建议调整到货款比例至15%，使三项合计不超过70%",
        ruleId: "rule-1",
        excerpt: "预付款35%+投料款20%+到货款30%=85%，超过公司规定的验收前付款70%上限，存在较大资金风险。",
      },
      {
        id: "risk-7",
        contractId: "1",
        category: "付款",
        riskType: "commercial",
        level: "medium",
        description: "质量保证金风险: 存在质量保证金",
        location: "第三条 付款方式 第4款",
        suggestion: "质保金比例仅5%，低于公司规定的10%标准，建议提高至10%以确保质量保障",
        ruleId: "rule-1",
        excerpt: "质保金：质保期满后支付5%。质保期为设备验收合格后5年。",
      },
      {
        id: "risk-8",
        contractId: "1",
        category: "保修SLA",
        riskType: "technical",
        level: "medium",
        description: "到场服务窗口",
        location: "第六条 质量保证 第3款",
        suggestion: "建议明确故障响应时间为4小时内，到场服务时间为24小时内，确保及时维护",
        ruleId: "rule-3",
        excerpt: "质保期内出现故障，乙方应及时响应并提供维修服务，但未明确具体的响应时间和到场时间要求。",
      },
      {
        id: "risk-9",
        contractId: "1",
        category: "保修SLA",
        riskType: "technical",
        level: "low",
        description: "响应时间",
        location: "第六条 质量保证 第3款",
        suggestion: "建议补充7×24小时服务热线和远程诊断支持条款",
        ruleId: "rule-3",
        excerpt: "乙方承诺在接到故障通知后4小时内响应，24小时内到达现场进行维修。",
      },
      {
        id: "risk-10",
        contractId: "2",
        category: "付款",
        riskType: "commercial",
        level: "medium",
        description: "付款条件",
        location: "第三条 付款方式",
        suggestion: "建议增加付款条件的明确约定，包括发票提供时间和付款审批流程",
        ruleId: "rule-1",
        excerpt: "合同约定分期付款，但未明确每期付款的具体条件和所需提供的单据清单。",
      },
      {
        id: "risk-11",
        contractId: "2",
        category: "法务条款",
        riskType: "legal",
        level: "high",
        description: "违约责任条款中未明确赔偿上限",
        location: "第八条 违约责任 第3款",
        suggestion: "建议增加违约赔偿上限条款，建议设定为合同总额的20%",
        ruleId: "rule-2",
        excerpt: "任何一方违约应承担违约责任，向守约方支付违约金，但未明确违约金的计算方式和赔偿上限。",
      },
    ],
    overallRiskLevel: "high",
    summary: "该合同存在2个高风险点和5个中风险点，主要集中在商务条款和法务条款方面。",
    contractContent: `# 风机采购合同

## 第一条 合同双方
甲方：某风电开发有限公司
乙方：远景能源有限公司

## 第二条 合同标的
乙方向甲方提供风力发电机组及相关设备...

## 第三条 付款方式
1. 预付款：合同签订后7日内，甲方支付合同总额的35%作为预付款
2. 进度款：设备到货后支付30%
3. 验收款：验收合格后支付30%
4. 质保金：质保期满后支付5%

## 第四条 交付时间
设备应于2025年12月31日前交付完毕...

## 第五条 技术规格
1. 风机型号：TMR750
2. 额定功率：需满足相关技术要求
3. 其他技术参数见附件...`,
    markdownPreview: `# 风机采购合同

**合同编号**: 2025-3.28-Pyzh25079  
**签订日期**: 2025年3月28日

---

## 合同双方

**甲方（买方）**: 某风电开发有限公司  
**乙方（卖方）**: 远景能源有限公司

---

## 第一条 合同标的

乙方向甲方提供 **TMR750型风力发电机组** 及相关配套设备，具体规格和数量详见附件《设备清单》。

---

## 第二条 合同金额

合同总金额为人民币 **壹仟伍佰万元整（¥15,000,000）**

---

## 第三条 付款方式

| 付款节点 | 比例 | 付款时间规定 |
|---------|------|-------------|
| 预付款 | 35% | 合同签订后7日内 |
| 进度款 | 30% | 设备到货后15日内 |
| 验收款 | 30% | 验收合格后15日内 |
| 质保金 | 5% | 质保期满后30日内 |

---

## 第四条 交付时间

设备应于 **2025年12月31日** 前交付完毕，具体交付计划如下：
- 第一批：2025年9月30日前
- 第二批：2025年12月31日前

---

## 第五条 技术规格

### 5.1 基本参数
- 风机型号：TMR750
- 额定功率：7.5MW
- 叶轮直径：需满足相关技术要求
- 塔筒高度：根据现场条件确定

### 5.2 性能要求
设备性能应满足国家相关标准及行业规范要求。

---

## 第六条 质量保证

乙方对所供设备提供 **5年质量保证期**，质保期内出现质量问题由乙方负责免费维修或更换。`,
  },
}
