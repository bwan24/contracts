"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Search, Download, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { mockContracts, mockRiskPoints } from "@/lib/mock-data"
import type { RiskLevel, RiskPoint } from "@/lib/types"
import { exportRiskReportCSV } from "@/lib/export-utils"

export default function RiskAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterContract, setFilterContract] = useState<string>("all")
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | null>(null)

  const completedContracts = mockContracts.filter((c) => c.status === "completed")

  const filteredRisks = mockRiskPoints.filter((risk) => {
    const matchesSearch =
      risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = filterLevel === "all" || risk.level === filterLevel
    const matchesType = filterType === "all" || risk.riskType === filterType
    const matchesContract = filterContract === "all" || risk.contractId === filterContract
    return matchesSearch && matchesLevel && matchesType && matchesContract
  })

  const riskStats = {
    total: mockRiskPoints.length,
    high: mockRiskPoints.filter((r) => r.level === "high").length,
    medium: mockRiskPoints.filter((r) => r.level === "medium").length,
    low: mockRiskPoints.filter((r) => r.level === "low").length,
  }

  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return <Badge className="bg-destructive text-white">不符合标准</Badge>
      case "medium":
        return <Badge className="bg-warning text-white">待确认</Badge>
      case "low":
        return <Badge className="bg-success text-white">符合标准</Badge>
    }
  }

  const getRiskIcon = (level: RiskLevel) => {
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

  const getRiskTypeName = (type: string) => {
    switch (type) {
      case "commercial":
        return "商务风险"
      case "legal":
        return "法务风险"
      case "technical":
        return "技术风险"
      default:
        return type
    }
  }

  const handleExportAll = () => {
    const firstContract = completedContracts[0]
    if (firstContract) {
      exportRiskReportCSV({ ...firstContract, name: "全部合同风险汇总" }, filteredRisks)
    }
  }


  const groupedRisks = filteredRisks.reduce(
    (acc, risk) => {
      const category = risk.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(risk)
      return acc
    },
    {} as Record<string, RiskPoint[]>,
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">风险审核</h1>
          <p className="mt-2 text-muted-foreground">合同风险点识别与分析结果</p>
        </div>
        <Button className="gap-2" onClick={handleExportAll}>
          <Download className="h-4 w-4" />
          导出风险报告
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">风险总数</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{riskStats.total}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>已审核 {completedContracts.length} 份合同</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">高风险</p>
              <p className="mt-2 text-3xl font-bold text-destructive">{riskStats.high}</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            占比 {((riskStats.high / riskStats.total) * 100).toFixed(0)}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">中风险</p>
              <p className="mt-2 text-3xl font-bold text-warning">{riskStats.medium}</p>
            </div>
            <div className="rounded-lg bg-warning/10 p-3">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            占比 {((riskStats.medium / riskStats.total) * 100).toFixed(0)}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">低风险</p>
              <p className="mt-2 text-3xl font-bold text-success">{riskStats.low}</p>
            </div>
            <div className="rounded-lg bg-success/10 p-3">
              <AlertTriangle className="h-6 w-6 text-success" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            占比 {((riskStats.low / riskStats.total) * 100).toFixed(0)}%
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索风险描述或类别..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterContract} onValueChange={setFilterContract}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="合同名称" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部合同</SelectItem>
              {completedContracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="风险等级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部等级</SelectItem>
              <SelectItem value="high">高风险</SelectItem>
              <SelectItem value="medium">中风险</SelectItem>
              <SelectItem value="low">低风险</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="风险类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="commercial">商务风险</SelectItem>
              <SelectItem value="legal">法务风险</SelectItem>
              <SelectItem value="technical">技术风险</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                        {risks.map((risk) => (
                          <button
                            key={risk.id}
                            onClick={() => setSelectedRisk(risk)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                              selectedRisk?.id === risk.id ? "border-primary bg-accent" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="mb-1 font-medium text-foreground">{risk.description}</div>
                                <div className="text-xs text-destructive">
                                  合规性：{risk.level === "low" ? "符合标准" : "不符合标准"}
                                </div>
                              </div>
                              {getRiskIcon(risk.level)}
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
                      <h3 className="text-xl font-semibold text-foreground">{selectedRisk.description}</h3>
                      {getRiskLevelBadge(selectedRisk.level)} { getRiskIcon(selectedRisk.level)}
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contract Text Summary */}
                  <div>
                    <h4 className="mb-2 font-medium text-foreground">合同文本摘录</h4>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      {selectedRisk.excerpt ? (
                        <>
                          <p className="text-sm text-foreground">{selectedRisk.excerpt}</p>
                          <Button variant="outline" size="sm" className="mt-3 bg-transparent">
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
                      <p className="text-sm font-medium text-foreground">{selectedRisk.description}</p>
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
                          ? `该风险点为高风险项，可能对公司造成重大经济损失或法律风险。${selectedRisk.excerpt ? "根据合同文本分析，" + selectedRisk.suggestion : ""}`
                          : selectedRisk.level === "medium"
                            ? `该风险点为中等风险，需要关注并采取适当的风险控制措施。${selectedRisk.suggestion}`
                            : `该风险点为低风险，整体可控，建议按标准流程处理。${selectedRisk.suggestion}`}
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
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">风险分类统计</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">商务风险</span>
              <Badge variant="outline">{mockRiskPoints.filter((r) => r.riskType === "commercial").length}</Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${(mockRiskPoints.filter((r) => r.riskType === "commercial").length / mockRiskPoints.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">法务风险</span>
              <Badge variant="outline">{mockRiskPoints.filter((r) => r.riskType === "legal").length}</Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-secondary"
                style={{
                  width: `${(mockRiskPoints.filter((r) => r.riskType === "legal").length / mockRiskPoints.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">技术风险</span>
              <Badge variant="outline">{mockRiskPoints.filter((r) => r.riskType === "technical").length}</Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-info"
                style={{
                  width: `${(mockRiskPoints.filter((r) => r.riskType === "technical").length / mockRiskPoints.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
