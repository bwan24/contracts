"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Download, Settings } from "lucide-react"
import { mockAuditRules } from "@/lib/mock-data"
import type { AuditRule, RiskLevel, ContractType } from "@/lib/types"
import { exportRulesCSV } from "@/lib/export-utils"
import { RuleImportDialog } from "@/components/rule-import-dialog"

export default function RulesPage() {
  const [rules, setRules] = useState<AuditRule[]>(mockAuditRules)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AuditRule | null>(null)
  const [newRule, setNewRule] = useState({
    source: "红宝书",
    level: "high" as RiskLevel,
    mainSerialNumber: "1",
    l1Category: "商务风险",
    l1SerialNumber: "1.1",
    l2Category: "付款比例",
    l2SerialNumber: "1.1.1",
    l3Category: "比例风险",
    l3Name: "预付款和投料款合计比例审核",
    l3Standard: "预付款和投料款的付款比例 ≥合同总价 20%",
    l3Description: "审核合同中的预付款和投料款付款比例合理需要符合比例要求，大于等于20%",
    contractTypes: ["wind-turbine", "energy-storage"] as ContractType[],
    contractStandards: ["standard", "non-standard"],
    category: "", // 保留原有字段以确保兼容性
    name: "", // 保留原有字段以确保兼容性
    standard: "", // 保留原有字段以确保兼容性
    description: "", // 保留原有字段以确保兼容性
  })

  const categories = Array.from(new Set(rules.map((r) => r.category)))

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || rule.category === filterCategory
    const matchesLevel = filterLevel === "all" || rule.level === filterLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const handleAddRule = () => {
      // 确保newRule不为null
      if (!newRule) return;
      
      const rule: AuditRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      source: newRule.source || "红宝书",
      level: newRule.level,
      mainSerialNumber: newRule.mainSerialNumber || "1",
      l1Category: newRule.l1Category || "",
      l1SerialNumber: newRule.l1SerialNumber || "1.1",
      l2Category: newRule.l2Category || "",
      l2SerialNumber: newRule.l2SerialNumber || "1.1.1",
      l3Category: newRule.l3Category || "",
      l3Name: newRule.l3Name || "",
      l3Standard: newRule.l3Standard || "",
      l3Description: newRule.l3Description || "",
      contractTypes: newRule.contractTypes,
      contractStandards: newRule.contractStandards || [],
      // 兼容性保留字段
      category: newRule.l3Category || "",
      name: newRule.l3Name || "",
      standard: newRule.l3Standard || "",
      description: newRule.l3Description || "",
    }
    setRules([rule, ...rules])
    setAddDialogOpen(false)
    setNewRule({
      source: "红宝书",
      level: "medium" as RiskLevel,
      mainSerialNumber: "1",
      l1Category: "商务风险",
      l1SerialNumber: "1.1",
      l2Category: "付款比例",
      l2SerialNumber: "1.1.1",
      l3Category: "比例风险",
      l3Name: "",
      l3Standard: "",
      l3Description: "",
      contractTypes: ["wind-turbine", "energy-storage"] as ContractType[],
      contractStandards: ["standard", "non-standard"],
      category: "", // 保留原有字段以确保兼容性
      name: "", // 保留原有字段以确保兼容性
      standard: "", // 保留原有字段以确保兼容性
      description: "", // 保留原有字段以确保兼容性
    })
  }

  const handleEditRule = () => {
    // 确保editingRule不为null
    if (!editingRule) return
    setRules(
      rules.map((r) =>
        r.id === editingRule.id ? {
          ...editingRule,
          source: editingRule.source || "红宝书",
          mainSerialNumber: editingRule.mainSerialNumber || "1",
          l1Category: editingRule.l1Category || "",
          l1SerialNumber: editingRule.l1SerialNumber || "1.1",
          l2Category: editingRule.l2Category || "",
          l2SerialNumber: editingRule.l2SerialNumber || "1.1.1",
          l3Category: editingRule.l3Category || "",
          l3Name: editingRule.l3Name || "",
          l3Standard: editingRule.l3Standard || "",
          l3Description: editingRule.l3Description || "",
          contractTypes: editingRule.contractTypes || [],
          contractStandards: editingRule.contractStandards || [],
          updatedAt: new Date().toISOString().split("T")[0],
          // 兼容性保留字段
          category: editingRule.l3Category || "",
          name: editingRule.l3Name || "",
          standard: editingRule.l3Standard || "",
          description: editingRule.l3Description || "",
        } : r,
      ),
    )
    setEditingRule(null)
  }

  const handleDeleteRule = (id: string) => {
    if (confirm("确定要删除这条规则吗？")) {
      setRules(rules.filter((r) => r.id !== id))
    }
  }

  const handleImportRules = (importedRules: AuditRule[]) => {
    setRules([...importedRules, ...rules])
  }

  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">高风险</Badge>
      case "medium":
        return <Badge className="bg-warning text-white">中风险</Badge>
      case "low":
        return <Badge className="bg-success text-white">低风险</Badge>
    }
  }

  const ruleStats = {
    total: rules.length,
    high: rules.filter((r) => r.level === "high").length,
    medium: rules.filter((r) => r.level === "medium").length,
    low: rules.filter((r) => r.level === "low").length,
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">规则管理</h1>
          <p className="mt-2 text-muted-foreground">配置和管理风险审核规则</p>
        </div>
        <div className="flex gap-3">
          <RuleImportDialog onImport={handleImportRules} />
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => exportRulesCSV(rules)}>
            <Download className="h-4 w-4" />
            导出规则
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增规则
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>新增审核规则</DialogTitle>
                <DialogDescription>添加新的风险审核规则以完善审核标准</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="source">规则来源</Label>
                    <Input
                      id="source"
                      placeholder="例如：红宝书"
                      value={newRule.source}
                      onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">风险等级</Label>
                    <Select
                      value={newRule.level}
                      onValueChange={(value: RiskLevel) => setNewRule({ ...newRule, level: value })}
                    >
                      <SelectTrigger id="level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高风险</SelectItem>
                        <SelectItem value="medium">中风险</SelectItem>
                        <SelectItem value="low">低风险</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mainSerialNumber">序号</Label>
                    <Input
                      id="mainSerialNumber"
                      placeholder="例如：1"
                      value={newRule.mainSerialNumber}
                      onChange={(e) => setNewRule({ ...newRule, mainSerialNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l1Category">L1风险规则类别</Label>
                    <Input
                      id="l1Category"
                      placeholder="例如：商务风险"
                      value={newRule.l1Category}
                      onChange={(e) => setNewRule({ ...newRule, l1Category: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="l1SerialNumber">序号</Label>
                    <Input
                      id="l1SerialNumber"
                      placeholder="例如：1.1"
                      value={newRule.l1SerialNumber}
                      onChange={(e) => setNewRule({ ...newRule, l1SerialNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l2Category">L2风险规则类别</Label>
                    <Input
                      id="l2Category"
                      placeholder="例如：付款比例"
                      value={newRule.l2Category}
                      onChange={(e) => setNewRule({ ...newRule, l2Category: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="l2SerialNumber">序号</Label>
                    <Input
                      id="l2SerialNumber"
                      placeholder="例如：1.1.1"
                      value={newRule.l2SerialNumber}
                      onChange={(e) => setNewRule({ ...newRule, l2SerialNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l3Category">L3风险规则类别</Label>
                    <Input
                      id="l3Category"
                      placeholder="例如：比例风险"
                      value={newRule.l3Category}
                      onChange={(e) => setNewRule({ ...newRule, l3Category: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="l3Name">L3风险规则名称</Label>
                  <Input
                    id="l3Name"
                    placeholder="例如：预付款和投料款合计比例审核"
                    value={newRule.l3Name}
                    onChange={(e) => setNewRule({ ...newRule, l3Name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="l3Standard">L3规则标准约定</Label>
                  <Textarea
                    id="l3Standard"
                    placeholder="例如：预付款和投料款的付款比例 ≥合同总价 20%"
                    value={newRule.l3Standard}
                    onChange={(e) => setNewRule({ ...newRule, l3Standard: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="l3Description">L3标准规则描述</Label>
                  <Textarea
                    id="l3Description"
                    placeholder="详细说明该规则的审核要点和注意事项"
                    value={newRule.l3Description}
                    onChange={(e) => setNewRule({ ...newRule, l3Description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>适用合同类型</Label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newRule.contractTypes.includes("wind-turbine")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRule({
                              ...newRule,
                              contractTypes: [...newRule.contractTypes, "wind-turbine"],
                            })
                          } else {
                            setNewRule({
                              ...newRule,
                              contractTypes: newRule.contractTypes.filter((t) => t !== "wind-turbine"),
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">风机合同</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newRule.contractTypes.includes("energy-storage")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRule({
                              ...newRule,
                              contractTypes: [...newRule.contractTypes, "energy-storage"],
                            })
                          } else {
                            setNewRule({
                              ...newRule,
                              contractTypes: newRule.contractTypes.filter((t) => t !== "energy-storage"),
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">储能合同</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>使用合同标准</Label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newRule.contractStandards.includes("standard")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRule({
                              ...newRule,
                              contractStandards: [...newRule.contractStandards, "standard"],
                            })
                          } else {
                            setNewRule({
                              ...newRule,
                              contractStandards: newRule.contractStandards.filter((s) => s !== "standard"),
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">标准合同</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newRule.contractStandards.includes("non-standard")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRule({
                              ...newRule,
                              contractStandards: [...newRule.contractStandards, "non-standard"],
                            })
                          } else {
                            setNewRule({
                              ...newRule,
                              contractStandards: newRule.contractStandards.filter((s) => s !== "non-standard"),
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">非标合同</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddRule} disabled={!newRule || !newRule.source || !newRule.l1Category || !newRule.l2Category || !newRule.l3Category || !newRule.l3Name || !newRule.l3Standard || !newRule.l3Description || (!newRule.contractTypes || newRule.contractTypes.length === 0) || (!newRule.contractStandards || newRule.contractStandards.length === 0)}>
                  添加规则
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">规则总数</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{ruleStats.total}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Settings className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">高风险规则</p>
              <p className="mt-2 text-3xl font-bold text-destructive">{ruleStats.high}</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3">
              <Settings className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">中风险规则</p>
              <p className="mt-2 text-3xl font-bold text-warning">{ruleStats.medium}</p>
            </div>
            <div className="rounded-lg bg-warning/10 p-3">
              <Settings className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">低风险规则</p>
              <p className="mt-2 text-3xl font-bold text-success">{ruleStats.low}</p>
            </div>
            <div className="rounded-lg bg-success/10 p-3">
              <Settings className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索规则名称、类别或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="规则类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
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
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类别</TableHead>
                <TableHead>规则名称</TableHead>
                <TableHead>风险等级</TableHead>
                <TableHead>标准约定</TableHead>
                <TableHead>适用类型</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Settings className="mb-2 h-8 w-8" />
                      <p>暂无规则数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.category}</TableCell>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>{getRiskLevelBadge(rule.level)}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-sm">{rule.standard}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rule.contractTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type === "wind-turbine" ? "风机" : "储能"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={editingRule?.id === rule.id}
                          onOpenChange={(open) => !open && setEditingRule(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditingRule(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>编辑审核规则</DialogTitle>
                              <DialogDescription>修改规则信息以更新审核标准</DialogDescription>
                            </DialogHeader>
                            {editingRule && (
                              <div className="space-y-4 py-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-source">规则来源</Label>
                                    <Input
                                      id="edit-source"
                                      value={editingRule.source || "红宝书"}
                                      onChange={(e) => setEditingRule({ ...editingRule, source: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-level">风险等级</Label>
                                    <Select
                                      value={editingRule.level}
                                      onValueChange={(value: RiskLevel) =>
                                        setEditingRule({ ...editingRule, level: value })
                                      }
                                    >
                                      <SelectTrigger id="edit-level">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="high">高风险</SelectItem>
                                        <SelectItem value="medium">中风险</SelectItem>
                                        <SelectItem value="low">低风险</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-mainSerialNumber">序号</Label>
                                    <Input
                                      id="edit-mainSerialNumber"
                                      value={editingRule.mainSerialNumber || "1"}
                                      onChange={(e) => setEditingRule({ ...editingRule, mainSerialNumber: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-l1Category">L1风险规则类别</Label>
                                    <Input
                                      id="edit-l1Category"
                                      value={editingRule.l1Category || ""}
                                      onChange={(e) => setEditingRule({ ...editingRule, l1Category: e.target.value })}
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-l1SerialNumber">序号</Label>
                                    <Input
                                      id="edit-l1SerialNumber"
                                      value={editingRule.l1SerialNumber || "1.1"}
                                      onChange={(e) => setEditingRule({ ...editingRule, l1SerialNumber: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-l2Category">L2风险规则类别</Label>
                                    <Input
                                      id="edit-l2Category"
                                      value={editingRule.l2Category || ""}
                                      onChange={(e) => setEditingRule({ ...editingRule, l2Category: e.target.value })}
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-l2SerialNumber">序号</Label>
                                    <Input
                                      id="edit-l2SerialNumber"
                                      value={editingRule.l2SerialNumber || "1.1.1"}
                                      onChange={(e) => setEditingRule({ ...editingRule, l2SerialNumber: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-l3Category">L3风险规则类别</Label>
                                    <Input
                                      id="edit-l3Category"
                                      value={editingRule.l3Category || ""}
                                      onChange={(e) => setEditingRule({ ...editingRule, l3Category: e.target.value })}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-l3Name">L3风险规则名称</Label>
                                  <Input
                                    id="edit-l3Name"
                                    value={editingRule.l3Name || ""}
                                    onChange={(e) => setEditingRule({ ...editingRule, l3Name: e.target.value })}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-l3Standard">L3规则标准约定</Label>
                                  <Textarea
                                    id="edit-l3Standard"
                                    value={editingRule.l3Standard || ""}
                                    onChange={(e) => setEditingRule({ ...editingRule, l3Standard: e.target.value })}
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-l3Description">L3标准规则描述</Label>
                                  <Textarea
                                    id="edit-l3Description"
                                    value={editingRule.l3Description || ""}
                                    onChange={(e) => setEditingRule({ ...editingRule, l3Description: e.target.value })}
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>适用合同类型</Label>
                                  <div className="flex gap-4 flex-wrap">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={editingRule.contractTypes.includes("wind-turbine")}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditingRule({
                                              ...editingRule,
                                              contractTypes: [...editingRule.contractTypes, "wind-turbine"],
                                            })
                                          } else {
                                            setEditingRule({
                                              ...editingRule,
                                              contractTypes: editingRule.contractTypes.filter(
                                                (t) => t !== "wind-turbine",
                                              ),
                                            })
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <span className="text-sm">风机合同</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={editingRule.contractTypes.includes("energy-storage")}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditingRule({
                                              ...editingRule,
                                              contractTypes: [...editingRule.contractTypes, "energy-storage"],
                                            })
                                          } else {
                                            setEditingRule({
                                              ...editingRule,
                                              contractTypes: editingRule.contractTypes.filter(
                                                (t) => t !== "energy-storage",
                                              ),
                                            })
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <span className="text-sm">储能合同</span>
                                    </label>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>使用合同标准</Label>
                                  <div className="flex gap-4 flex-wrap">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={(editingRule.contractStandards || []).includes("standard")}
                                        onChange={(e) => {
                                          const currentStandards = editingRule.contractStandards || [];
                                          if (e.target.checked) {
                                            setEditingRule({
                                              ...editingRule,
                                              contractStandards: [...currentStandards, "standard"],
                                            })
                                          } else {
                                            setEditingRule({
                                              ...editingRule,
                                              contractStandards: currentStandards.filter((s) => s !== "standard"),
                                            })
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <span className="text-sm">标准合同</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={(editingRule.contractStandards || []).includes("non-standard")}
                                        onChange={(e) => {
                                          const currentStandards = editingRule.contractStandards || [];
                                          if (e.target.checked) {
                                            setEditingRule({
                                              ...editingRule,
                                              contractStandards: [...currentStandards, "non-standard"],
                                            })
                                          } else {
                                            setEditingRule({
                                              ...editingRule,
                                              contractStandards: currentStandards.filter((s) => s !== "non-standard"),
                                            })
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                      <span className="text-sm">非标合同</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setEditingRule(null)}>
                                取消
                              </Button>
                              <Button onClick={handleEditRule} disabled={!editingRule || !editingRule.source || !editingRule.l1Category || !editingRule.l2Category || !editingRule.l3Category || !editingRule.l3Name || !editingRule.l3Standard || !editingRule.l3Description || (!editingRule.contractTypes || editingRule.contractTypes.length === 0) || (!editingRule.contractStandards || editingRule.contractStandards.length === 0)}>
                                保存修改
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
