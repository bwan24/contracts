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
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import type { AuditRule } from "@/lib/types"
import { importRulesFromCSV, generateRuleTemplate } from "@/lib/import-utils"

interface RuleImportDialogProps {
  onImport: (rules: AuditRule[]) => void
  trigger?: React.ReactNode
}

export function RuleImportDialog({ onImport, trigger }: RuleImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    count: number
    message: string
  } | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const content = await file.text()
      const rules = importRulesFromCSV(content)

      if (rules.length === 0) {
        setImportResult({
          success: false,
          count: 0,
          message: "未能从文件中解析出有效的规则数据",
        })
      } else {
        onImport(rules)
        setImportResult({
          success: true,
          count: rules.length,
          message: `成功导入 ${rules.length} 条规则`,
        })
        setTimeout(() => {
          setOpen(false)
          setImportResult(null)
        }, 2000)
      }
    } catch (error) {
      setImportResult({
        success: false,
        count: 0,
        message: "文件解析失败，请检查文件格式是否正确",
      })
    } finally {
      setImporting(false)
      event.target.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            批量导入
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>批量导入审核规则</DialogTitle>
          <DialogDescription>从Excel/CSV文件批量导入审核规则</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-6">
            <div className="text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-sm font-medium text-foreground">上传Excel/CSV文件</h3>
              <p className="mt-2 text-xs text-muted-foreground">支持 .csv 格式，请确保文件格式符合模板要求</p>
              <div className="mt-4 flex flex-col gap-2">
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    className="w-full gap-2 bg-transparent"
                    disabled={importing}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {importing ? "导入中..." : "选择文件"}
                  </Button>
                  <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <Button variant="ghost" size="sm" className="gap-2" onClick={generateRuleTemplate}>
                  <Download className="h-4 w-4" />
                  下载导入模板
                </Button>
              </div>
            </div>
          </div>

          {importResult && (
            <div
              className={`flex items-start gap-3 rounded-lg p-4 ${
                importResult.success ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{importResult.message}</p>
                {importResult.success && <p className="mt-1 text-xs opacity-80">规则已添加到列表中</p>}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 text-sm font-medium text-foreground">导入说明</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• 文件必须包含表头：规则类别、规则名称、标准约定、风险等级、规则描述、适用合同类型</li>
              <li>• 风险等级填写：高风险、中风险、低风险</li>
              <li>• 适用合同类型填写：风机、储能 或 风机、储能</li>
              <li>• 建议先下载模板，按照模板格式填写数据</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
