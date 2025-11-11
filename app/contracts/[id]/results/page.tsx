"use client"
import { useState, useEffect, use, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ContractPreview from "./ContractPreview"
import PaymentRatioInformation from "./PaymentRatioInformation"
import RiskAuditResults from "./RiskAuditResults"
import { MarkdownHighlightContext } from "@/hooks/use-markdown-highlight"
import { MarkdownViewerRef } from "@/components/markdown-viewer"
import { mockContracts, mockContractAnalysis } from "@/lib/mock-data"

export default function ContractResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  // 创建ref来存储MarkdownViewer的引用
  const markdownViewerRef = useRef<MarkdownViewerRef>(null)
  
  // 使用URL参数中的ID或默认值
  const contractId = id || '1'
  
  // 查找合同数据，如果不存在则使用默认数据
  const contract = mockContracts.find((c) => c.id === contractId) || {
    id: contractId,
    name: `合同 ${contractId}`,
    type: 'default',
    uploadDate: '2024-01-01',
    status: 'completed',
    fileSize: '未知'
  }
  
  // 获取分析数据，如果不存在则提供默认数据
  const analysis = mockContractAnalysis[contractId] || {
    markdownPreview: '# 默认合同预览\n\n这是一个默认的合同预览内容。',
    riskLevel: 'low',
    paymentRatios: []
  }
  
  // 高亮文本的方法
  const highlightText = (text: string) => {
    console.log("[Page] Highlighting text:", text);
    console.log("[Page] markdownViewerRef.current是否存在:", !!markdownViewerRef.current);
    if (markdownViewerRef.current) {
      console.log("[Page] 调用markdownViewerRef.current.highlightAndScrollTo");
      const result = markdownViewerRef.current.highlightAndScrollTo(text);
      console.log("[Page] highlightAndScrollTo执行结果:", result);
    } else {
      console.log("[Page] markdownViewerRef.current不存在，无法调用highlightAndScrollTo");
    }
  }
  
  // 清除高亮的方法
  const clearHighlight = () => {
    console.log("[Page] Clearing highlight");
    if (markdownViewerRef.current) {
      markdownViewerRef.current.clearHighlight();
    }
  }

  // 即使没有找到完全匹配的合同，我们也提供了默认数据，所以可以直接渲染页面

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <span>高风险</span>
          </Badge>
        )
      case "medium":
        return (
          <Badge className="gap-1 bg-warning text-white">
            <span>中风险</span>
          </Badge>
        )
      case "low":
        return (
          <Badge className="gap-1 bg-success text-white">
            <span>低风险</span>
          </Badge>
        )
      default:
        return null
    }
  }

  return (
      <MarkdownHighlightContext.Provider value={{ highlightText, clearHighlight, markdownViewerRef: markdownViewerRef as React.RefObject<MarkdownViewerRef> }}>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/contracts">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回列表
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-2xl font-bold tracking-tight text-foreground">合同详情 :{contract.name}</div>
        <div>
          <div>
            <span>上传时间：{contract.uploadDate || '未知'}</span>
            <span>文件大小：未知</span>
          </div>
        </div>

        {/* 使用拆分后的组件 */}
        <ContractPreview contractId={contractId} markdownViewerRef={markdownViewerRef as React.RefObject<MarkdownViewerRef>} />
        <PaymentRatioInformation />
        <RiskAuditResults />
      </div>
    </MarkdownHighlightContext.Provider>
  )
}
