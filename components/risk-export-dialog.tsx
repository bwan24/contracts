"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react"
import type { Contract, RiskPoint } from "@/lib/types"
import { exportRiskReportJSON, exportRiskReportCSV, generateRiskSummary } from "@/lib/export-utils"

interface RiskExportDialogProps {
  contract: Contract
  risks: RiskPoint[]
  trigger?: React.ReactNode
}

export function RiskExportDialog({ contract, risks, trigger }: RiskExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "summary">("csv")

  const handleExport = () => {
    switch (exportFormat) {
      case "json":
        exportRiskReportJSON(contract, risks)
        break
      case "csv":
        exportRiskReportCSV(contract, risks)
        break
      case "summary":
        const summary = generateRiskSummary(contract, risks)
        const blob = new Blob([summary], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${contract.name}-风险摘要-${new Date().toISOString().split("T")[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        break
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            导出报告
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>导出风险报告</DialogTitle>
          <DialogDescription>选择导出格式以下载合同风险审核报告</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="csv" id="csv" className="mt-1" />
              <Label htmlFor="csv" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-success" />
                  <span className="font-medium">Excel / CSV 格式</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">适合在Excel中查看和分析，包含完整的风险数据表格</p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="json" id="json" className="mt-1" />
              <Label htmlFor="json" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  <span className="font-medium">JSON 格式</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">结构化数据格式，适合系统集成和数据处理</p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="summary" id="summary" className="mt-1" />
              <Label htmlFor="summary" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-warning" />
                  <span className="font-medium">文本摘要</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">简洁的文本格式报告，包含风险统计和高风险项详情</p>
              </Label>
            </div>
          </RadioGroup>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">导出内容：</span>
              {risks.length} 项风险点，包括 {risks.filter((r) => r.level === "high").length} 项高风险
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
