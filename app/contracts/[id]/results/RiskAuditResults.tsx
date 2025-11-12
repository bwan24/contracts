"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, AlertTriangle, CheckCircle2, AlertCircle, Download } from "lucide-react"
import { useMarkdownHighlight } from "@/hooks/use-markdown-highlight"

interface RiskAuditResultsProps {
  // 可以添加实际需要的props
}

interface RiskPoint {
  id: string
  title: string
  category: string
  level: 'high' | 'medium' | 'low'
  riskType: 'commercial' | 'legal' | 'technical'
  description: string
  location: string
  referenceClause: string
  assessment: string
  suggestion: string
  ruleId?: string
}

interface ContractAnalysis {
  overallRiskLevel: 'high' | 'medium' | 'low'
  riskPoints: RiskPoint[]
}

export default function RiskAuditResults({}: RiskAuditResultsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | null>(null)
  // 使用高亮功能的hook
  const { highlightText } = useMarkdownHighlight()

  // Mock数据
  const analysis: ContractAnalysis = {
    overallRiskLevel: "medium",
    riskPoints: [
      {
        id: "risk-1",
        title: "付款比例风险",
        category: "商务风险",
        level: "high",
        riskType: "commercial",
        description: "预付款比例过高（35%），超过行业标准（通常为20-30%）",
        location: "某风电开发有限公司",
        referenceClause: "建议将预付款比例调整为20-30%之间",
        assessment: "预付款比例过高可能导致我方资金压力增大，建议协商降低",
        suggestion: "建议将预付款比例调整为20%，并增加进度验收节点"
      },
      {
        id: "risk-2",
        title: "交付时间风险",
        category: "商务风险",
        level: "medium",
        riskType: "commercial",
        description: "交付时间过于紧张，可能影响交付质量",
        location: "第四条 交付时间",
        referenceClause: "建议适当延长交付周期",
        assessment: "考虑到项目复杂性，建议延长交付时间或增加分期交付方案",
        suggestion: "建议将最终交付日期延长至2026年2月28日"
      },
      {
        id: "risk-3",
        title: "质量保证期风险",
        category: "法务风险",
        level: "medium",
        riskType: "legal",
        description: "质量保证期仅为5年，低于行业标准（通常为10年）",
        location: "第六条 质量保证",
        referenceClause: "行业标准质保期为10年",
        assessment: "质保期过短可能导致后期维护成本增加",
        suggestion: "建议将质量保证期延长至10年"
      },
      {
        id: "risk-4",
        title: "技术规格不明确",
        category: "技术风险",
        level: "low",
        riskType: "technical",
        description: "叶轮直径等关键技术参数未明确规定具体数值",
        location: "第五条 技术规格第5.1款",
        referenceClause: "建议明确具体技术参数值",
        assessment: "技术参数不明确可能导致验收争议",
        suggestion: "建议明确叶轮直径具体数值：≥150米"
      },
      {
        id: "risk-5",
        title: "违约责任不明确",
        category: "法务风险",
        level: "high",
        riskType: "legal",
        description: "合同中未明确约定违约责任及赔偿标准",
        location: "未明确约定",
        referenceClause: "建议补充违约责任条款",
        assessment: "缺乏明确的违约责任条款可能导致争议解决困难",
        suggestion: "建议增加专门的违约责任章节，明确约定双方违约情形及赔偿标准"
      }
    ]
  }

  // 按类别分组风险项
  const groupedRisks: Record<string, RiskPoint[]> = analysis.riskPoints.reduce((acc, risk) => {
    if (!acc[risk.category]) {
      acc[risk.category] = [];
    }
    acc[risk.category].push(risk);
    return acc;
  }, {} as Record<string, RiskPoint[]>);

  // 获取风险类型名称
  const getRiskTypeName = (riskType: string) => {
    switch (riskType) {
      case "commercial":
        return "商务风险";
      case "legal":
        return "法务风险";
      case "technical":
        return "技术风险";
      default:
        return riskType;
    }
  };

  const scrollToSection = (location: string) => {
    setActiveSection(location)
    console.log("[RiskAudit] Scrolling to:", location)
    console.log("[RiskAudit] highlightText是否存在:", !!highlightText)
    // 使用高亮功能
    if (highlightText) {
      highlightText(location)
    }
  }

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            高
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="gap-1 bg-yellow-500 text-white">
            中
          </Badge>
        )
      case "low":
        return (
          <Badge variant="secondary" className="gap-1 bg-green-500 text-white">
            低
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Risk List */}
        <Card className="border-2">
          <div className="border-b bg-muted/30 p-4">
            <h2 className="text-lg font-semibold text-foreground">合同审核结果</h2>
            <p className="text-sm text-muted-foreground">查看各模板下的条款识别概览</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto p-4">
            {Object.keys(groupedRisks).length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                  <AlertTriangle className="mb-2 h-8 w-8" />
                  <p>暂无风险数据</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedRisks).map(([category, risks]) => (
                    <div key={category}>
                      <h3 className="mb-3 font-semibold text-foreground">{category}</h3>
                      <div className="space-y-2">
                        {risks && risks.map((risk) => (
                          <button
                            key={risk.id}
                            onClick={() => setSelectedRisk(risk)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${selectedRisk?.id === risk.id ? 'border-primary bg-accent' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="mb-1 font-medium text-foreground">{risk.title}</div>
                                <div className="text-xs text-destructive">合规性：{risk.level === "low" ? "符合标准" : "不符合标准"}</div>
                              </div>
                              {getRiskLevelBadge(risk.level)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </Card>

          {/* Right Panel - Risk Detail */}
          <Card className="border-2">
            <div className="border-b bg-muted/30 p-4">
              <h2 className="text-lg font-semibold text-foreground">审核结果详情</h2>
              <p className="text-sm text-muted-foreground">查看条款差异、风险等级与整改建议</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-6">
            {selectedRisk ? (
                <div className="space-y-6">
                  {/* Risk Title */}
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        通用模板
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        类别：{getRiskTypeName(selectedRisk.riskType)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-foreground">{selectedRisk.title}</h3>
                      {getRiskLevelBadge(selectedRisk.level)}
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contract Text Summary */}
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">合同文本摘录</h4>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      {selectedRisk.location ? (
                        <>
                          <p className="text-sm text-foreground">{selectedRisk.location}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 bg-transparent"
                            onClick={() => scrollToSection(selectedRisk.location)}
                          >
                            <MapPin className="mr-1 h-3.5 w-3.5" />
                            在文本中定位
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">暂无摘录</p>
                      )}
                    </div>
                  </div>

                  {/* Standard Reference */}
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">标准条款参考</h4>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <Badge className="mb-2 bg-purple-500 text-white">{getRiskTypeName(selectedRisk.riskType)}</Badge>
                      <p className="text-sm font-medium text-foreground">{selectedRisk.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {selectedRisk.level === "high"
                          ? "根据公司风控政策，该条款存在重大风险，需要立即整改。"
                          : selectedRisk.level === "medium"
                            ? "该条款存在一定风险，建议优化调整以符合标准要求。"
                            : "该条款基本符合标准，建议进一步完善细节。"}
                      </p>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">风险评估</h4>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h5 className="mb-2 text-sm font-medium text-foreground">风险说明</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedRisk.level === "high"
                          ? `该风险点为高风险项，可能对公司造成重大经济损失或法律风险。${selectedRisk.assessment ? "根据合同文本分析，" + selectedRisk.assessment : ""}`
                          : selectedRisk.level === "medium"
                            ? `该风险点为中等风险，需要关注并采取适当的风险控制措施。${selectedRisk.assessment}`
                            : `该风险点为低风险，整体可控，建议按标准流程处理。${selectedRisk.assessment}`}
                      </p>
                    </div>
                  </div>

                  {/* Rectification Suggestions */}
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">整改建议</h4>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h5 className="mb-2 text-sm font-medium text-foreground">建议补充</h5>
                      <p className="text-sm text-muted-foreground">{selectedRisk.suggestion}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-muted-foreground">
                  <AlertTriangle className="mb-2 h-12 w-12" />
                  <p>请从左侧选择一个风险项查看详情</p>
                </div>
              )}
          </div>
          </Card>
        </div>
  )
}
