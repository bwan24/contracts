import { Card } from "@/components/ui/card"
import { FileText, AlertTriangle, CheckCircle, Clock, Settings } from "lucide-react"
import { mockContracts, mockRiskPoints } from "@/lib/mock-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const totalContracts = mockContracts.length
  const completedContracts = mockContracts.filter((c) => c.status === "completed").length
  const analyzingContracts = mockContracts.filter((c) => c.status === "analyzing").length
  const totalRisks = mockRiskPoints.length
  const highRisks = mockRiskPoints.filter((r) => r.level === "high").length

  const stats = [
    {
      name: "合同总数",
      value: totalContracts,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "已完成审核",
      value: completedContracts,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      name: "审核中",
      value: analyzingContracts,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      name: "高风险项",
      value: highRisks,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]

  const recentContracts = mockContracts.slice(0, 5)

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">工作台</h1>
        <p className="mt-2 text-muted-foreground">合同风险智能审核系统概览</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">最近上传的合同</h2>
            <Link href="/contracts">
              <Button variant="ghost" size="sm">
                查看全部
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{contract.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.type === "wind-turbine" ? "风机合同" : "储能合同"} · {contract.uploadDate}
                    </p>
                  </div>
                </div>
                <div>
                  {contract.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      <CheckCircle className="h-3 w-3" />
                      已完成
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      <Clock className="h-3 w-3" />
                      审核中
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">风险分布统计</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">高风险</span>
                <span className="text-sm font-bold text-destructive">{highRisks} 项</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-destructive" style={{ width: `${(highRisks / totalRisks) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">中风险</span>
                <span className="text-sm font-bold text-warning">5 项</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-warning" style={{ width: "45%" }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">低风险</span>
                <span className="text-sm font-bold text-success">3 项</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-success" style={{ width: "27%" }} />
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">风险提示：</span>
              当前有 {highRisks} 个高风险项需要重点关注，建议优先处理。
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">快速操作</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/contracts">
            <Button variant="outline" className="h-auto w-full flex-col gap-2 py-6 bg-transparent">
              <FileText className="h-8 w-8" />
              <span className="font-medium">上传新合同</span>
              <span className="text-xs text-muted-foreground">开始智能审核</span>
            </Button>
          </Link>
          <Link href="/risk-analysis">
            <Button variant="outline" className="h-auto w-full flex-col gap-2 py-6 bg-transparent">
              <AlertTriangle className="h-8 w-8" />
              <span className="font-medium">查看风险报告</span>
              <span className="text-xs text-muted-foreground">分析审核结果</span>
            </Button>
          </Link>
          <Link href="/rules">
            <Button variant="outline" className="h-auto w-full flex-col gap-2 py-6 bg-transparent">
              <Settings className="h-8 w-8" />
              <span className="font-medium">管理审核规则</span>
              <span className="text-xs text-muted-foreground">配置风险标准</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
