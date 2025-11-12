"use client"

import { use, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Calendar, Tag, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { MarkdownViewer } from "@/components/markdown-viewer"
import { RiskExportDialog } from "@/components/risk-export-dialog"

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/contracts/${id}`)
        const data = await response.json()
        
        if (data.success) {
          setContract(data.data)
          console.log('hello', data.data)
        } else {
          setError(data.message || '获取合同详情失败')
        }
      } catch (err) {
        setError('网络错误，请稍后重试')
        console.error('获取合同详情失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">正在加载合同详情...</p>
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">合同未找到</h2>
          <p className="mt-2 text-muted-foreground">该合同不存在或已被删除</p>
          <Link href="/contracts">
            <Button className="mt-4">返回合同列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Link href="/contracts">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{contract.name}</h1>
          <p className="mt-2 text-muted-foreground">合同详情与内容解析</p>
        </div>
        {contract.status === "completed" && contract.riskCount && (contract.riskCount.high || contract.riskCount.medium || contract.riskCount.low) > 0 && (
          <RiskExportDialog contract={contract} risks={[]} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">合同基本信息</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">合同名称</p>
                <p className="mt-1 text-foreground">{contract.name}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">合同类型</p>
                <p className="mt-1 text-foreground">{contract.type === "wind-turbine" ? "风机合同" : "储能合同"}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">上传日期</p>
                <p className="mt-1 text-foreground">{contract.uploadDate}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">合同标准</p>
                <Badge variant="outline" className="mt-1">
                  {contract.standard === "standard" ? "标准合同" : "非标合同"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">审核状态</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">当前状态</p>
              {contract.status === "completed" ? (
                <Badge className="mt-2 bg-success text-white">审核完成</Badge>
              ) : contract.status === "analyzing" ? (
                <Badge className="mt-2 bg-warning text-white">审核中</Badge>
              ) : (
                <Badge variant="secondary" className="mt-2">
                  待处理
                </Badge>
              )}
            </div>
            {contract.status === "completed" && contract.riskCount && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">风险统计</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">高风险</span>
                      <Badge variant="destructive">{contract.riskCount.high}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">中风险</span>
                      <Badge className="bg-warning text-white">{contract.riskCount.medium}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">低风险</span>
                      <Badge className="bg-success text-white">{contract.riskCount.low}</Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">原始合同内容</h2>
        <div className="rounded-lg border bg-muted/30 h-[500px]">
          {contract.markdown_content && contract.markdown_content.trim() !== '' ? (
            <MarkdownViewer content={contract.markdown_content} className="h-full" />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">暂无解析后的合同内容</p>
                <p className="text-sm text-muted-foreground">合同ID: {id}</p>
                <p className="text-sm text-muted-foreground">API响应: {JSON.stringify({ hasMarkdown: !!contract.markdown_content, type: typeof contract.markdown_content })}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {contract.status === "completed" && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">关键要素识别</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">合同双方</p>
              <p className="mt-2 text-foreground">甲方：远景能源有限公司</p>
              <p className="text-foreground">乙方：XX风电设备制造有限公司</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">合同金额</p>
              <p className="mt-2 text-lg font-semibold text-foreground">¥ 15,800,000</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">生效日期</p>
              <p className="mt-2 text-foreground">2024年1月15日</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">交付期限</p>
              <p className="mt-2 text-foreground">2024年6月30日前</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
