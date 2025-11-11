"use client"

import { use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, AlertTriangle, FileText, Lightbulb, MapPin } from "lucide-react"
import Link from "next/link"
import { mockRiskPoints, mockContracts, mockAuditRules } from "@/lib/mock-data"
import type { RiskLevel } from "@/lib/types"

export default function RiskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const risk = mockRiskPoints.find((r) => r.id === id)
  const contract = risk ? mockContracts.find((c) => c.id === risk.contractId) : null
  const rule = risk ? mockAuditRules.find((r) => r.id === risk.ruleId) : null

  if (!risk) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">风险未找到</h2>
          <p className="mt-2 text-muted-foreground">该风险点不存在或已被删除</p>
          <Link href="/risk-analysis">
            <Button className="mt-4">返回风险列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            高风险
          </Badge>
        )
      case "medium":
        return (
          <Badge className="gap-1 bg-warning text-white">
            <AlertTriangle className="h-3 w-3" />
            中风险
          </Badge>
        )
      case "low":
        return <Badge className="gap-1 bg-success text-white">低风险</Badge>
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

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Link href="/risk-analysis">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">风险详情</h1>
            {getRiskLevelBadge(risk.level)}
          </div>
          <p className="mt-2 text-muted-foreground">{risk.category}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">风险描述</h2>
          <div className="space-y-6">
            <div className="rounded-lg border-l-4 border-destructive bg-destructive/5 p-4">
              <p className="text-foreground">{risk.description}</p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">风险位置</h3>
              </div>
              <p className="text-sm text-muted-foreground">{risk.location}</p>
            </div>

            <Separator />

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h3 className="font-medium text-foreground">整改建议</h3>
              </div>
              <div className="rounded-lg bg-warning/10 p-4">
                <p className="text-sm text-foreground">{risk.suggestion}</p>
              </div>
            </div>

            {rule && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 font-medium text-foreground">关联审核规则</h3>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-foreground">{rule.name}</span>
                      {getRiskLevelBadge(rule.level)}
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">{rule.description}</p>
                    <div className="mt-3 rounded bg-background p-3">
                      <p className="text-xs font-medium text-muted-foreground">标准约定</p>
                      <p className="mt-1 text-sm text-foreground">{rule.standard}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">风险信息</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">风险类型</p>
                <Badge variant="outline" className="mt-1">
                  {getRiskTypeName(risk.riskType)}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">风险等级</p>
                <div className="mt-1">{getRiskLevelBadge(risk.level)}</div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">风险类别</p>
                <p className="mt-1 text-foreground">{risk.category}</p>
              </div>
            </div>
          </Card>

          {contract && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">关联合同</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{contract.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {contract.type === "wind-turbine" ? "风机合同" : "储能合同"}
                    </p>
                  </div>
                </div>
                <Link href={`/contracts/${contract.id}`}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    查看合同详情
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
