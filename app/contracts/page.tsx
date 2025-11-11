"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Search, Download, Trash2, RefreshCw, FileCheck, CheckCircle2 } from "lucide-react"
import { mockContracts } from "@/lib/mock-data"
import type { Contract, ContractType, ContractStandard } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ContractsPage() {
  // 定义一个函数来重新获取合同列表（模拟刷新）
  const refreshContracts = () => {
    // 模拟从API重新获取数据，实际应用中可能会调用后端API
    console.log('刷新合同列表...');
    setContracts([...mockContracts]); // 创建新数组以触发组件重新渲染
  };
  
  const [contracts, setContracts] = useState<Contract[]>(mockContracts)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [newContract, setNewContract] = useState({ type: '', standard: '', files: [] } as { type: string, standard: string, files: File[] })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('') // 增强的上传状态提示
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false) // 全局加载状态
  
  // 每个文件的上传进度状态
  const [fileProgress, setFileProgress] = useState<{[key: string]: number}>({})

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || contract.type === filterType
    return matchesSearch && matchesType
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewContract({ ...newContract, files: Array.from(e.target.files) })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      // 过滤只接受docx和pdf文件
      const validFiles = files.filter(file => 
        file.type === 'application/pdf' || 
        file.name.toLowerCase().endsWith('.docx')
      )
      
      if (validFiles.length > 0) {
        // 显示文件信息，包括大小和类型
        validFiles.forEach(file => {
          console.log(`检测到文件: ${file.name}, 大小: ${(file.size / 1024).toFixed(2)} KB, 类型: ${file.type || '未知'}`);
          console.log(`文件将被保存到: public/contracts/${file.name}`);
        });
        
        setNewContract({ ...newContract, files: validFiles })
        
        // 显示成功提示
        toast({
          variant: "default",
          title: "文件选择成功",
          description: `已选择 ${validFiles.length} 个有效文件，将保存到public/contracts目录`,
          duration: 2000
        })
      } else {
        toast({
          variant: "destructive",
          title: "文件格式不支持",
          description: "请上传Word(.docx)或PDF格式的文件",
        })
      }
    }
  }

  // 处理文件上传
  const handleUpload = async () => {
    const { files, type, standard } = newContract
    
    // 详细的输入验证和边界条件检查
    if (!files || !Array.isArray(files)) {
      console.error('[验证错误] 文件列表无效');
      toast({ title: "文件列表无效，请重试", variant: "destructive" })
      return
    }
    
    if (!files.length) {
      console.error('[验证错误] 未选择任何文件');
      toast({ title: "请选择至少一个文件", variant: "destructive" })
      return
    }
    
    if (!type || type.trim() === '') {
      console.error('[验证错误] 合同类型为空');
      toast({ title: "请选择合同类型", variant: "destructive" })
      return
    }
    
    if (!standard || standard.trim() === '') {
      console.error('[验证错误] 合同标准为空');
      toast({ title: "请选择合同标准", variant: "destructive" })
      return
    }
    
    // 记录上传开始信息
    console.log(`[上传开始] 准备上传 ${files.length} 个文件`);
    console.log(`[上传开始] 合同类型: ${type}, 合同标准: ${standard}`);
    files.forEach((file, index) => {
      console.log(`[上传文件 ${index + 1}] ${file.name}, 大小: ${file.size} bytes, 类型: ${file.type}`);
    });

    setUploading(true)
      setUploadProgress(0)
      setUploadStatus('正在准备上传...')
      // 初始化每个文件的进度为0
      setFileProgress(files.reduce((acc, file) => {
        acc[file.name] = 0;
        return acc;
      }, {} as {[key: string]: number}));
      
      // 初始化保存的文件路径数组
      const savedFilePaths: string[] = new Array(files.length);
      
      // 模拟检查public/contracts目录是否存在
      console.log('[模拟] 检查public/contracts目录是否存在...');
      // 在实际环境中，这会由后端API处理，确保目录存在并具有正确的权限
      console.log('[模拟] 目录检查完成，public/contracts目录已准备就绪');

    try {
        // 创建FormData对象（虽然现在是模拟上传，但仍保持数据结构以便未来扩展）
        console.log('[模拟] 创建上传数据结构...');
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append('files', file);
          formData.append(`type_${index}`, type);
          formData.append(`standard_${index}`, standard);
        });
        
        // 模拟逐个文件上传和保存到public目录
        console.log('[模拟] 开始逐个文件上传...');
        let currentFileIndex = 0;
        const uploadPromises = files.map(async (file, index) => {
          // 等待当前文件上传完成
          return new Promise<void>((resolve) => {
            // 固定的上传时间，确保进度条动画更明显
            const uploadDuration = 2000; // 2秒，让用户体验更快
            const updateInterval = 200; // 每200毫秒更新一次进度
            const totalUpdates = uploadDuration / updateInterval;
            let updateCount = 0;
            
            // 创建一个内部的文件进度对象
            const currentFileProgress = { ...fileProgress };
            
            const interval = setInterval(() => {
              updateCount++;
              const newProgress = Math.floor((updateCount / totalUpdates) * 100);
              
              // 更新当前文件进度
              currentFileProgress[file.name] = newProgress;
              
              // 立即更新文件进度状态
              setFileProgress({...currentFileProgress});
              
              // 计算整体进度 - 当前文件的进度占总进度的比例
              const fileContribution = newProgress / files.length;
              
              // 计算其他已上传文件的贡献
              let otherFilesContribution = 0;
              if (index > 0) {
                // 前面的文件已经100%完成
                otherFilesContribution = index * (100 / files.length);
              }
              
              // 计算后面文件的预估进度（假设它们尚未开始）
              const remainingFilesCount = files.length - index - 1;
              const remainingFilesContribution = remainingFilesCount * 0; // 后面的文件进度为0
              
              // 计算总进度
              const totalProgress = fileContribution + otherFilesContribution + remainingFilesContribution;
              setUploadProgress(Math.min(Math.round(totalProgress), 100));
              
              // 更新上传状态信息
              setUploadStatus(`正在上传第 ${index + 1}/${files.length} 个文件: ${file.name} (${newProgress}%)`);
              
              // 当达到100%或更新次数达到预期时，完成上传
              if (updateCount >= totalUpdates || newProgress >= 100) {
                clearInterval(interval);
                
                // 确保文件进度是100%
                currentFileProgress[file.name] = 100;
                setFileProgress({...currentFileProgress});
                
                // 计算最终整体进度
                const finalProgress = ((index + 1) / files.length) * 100;
                setUploadProgress(Math.min(Math.round(finalProgress), 100));
                
                // 模拟文件保存到public/contracts目录的逻辑
                // 注意：在真实环境中，这需要由后端API处理，前端无法直接写入服务器文件系统
                const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`; // 添加时间戳避免文件覆盖
                const savePath = `public/contracts/${fileName}`;
                const publicAccessPath = `/contracts/${fileName}`;
                
                console.log(`[模拟] 文件 ${file.name} 已上传完成并保存到: ${savePath}`);
                console.log(`[模拟] 前端可通过路径: ${publicAccessPath} 访问该文件`);
                
                // 存储文件的公共访问路径，用于后续显示和下载
                savedFilePaths[index] = publicAccessPath;
                
                resolve();
              }
            }, updateInterval); // 使用固定的更新间隔
          });
        });
        
        // 等待所有文件上传完成
        console.log('[模拟] 等待所有文件上传完成...');
        await Promise.all(uploadPromises);
        
        // 完全移除真实的API调用，使用模拟数据
        console.log('[模拟] 所有文件上传和保存操作已完成，跳过实际API调用');
        
        // 所有文件上传完成
        setUploadProgress(100);
        setUploadStatus('所有文件上传完成!');
        
        // 模拟API响应结果
        console.log('[模拟] 生成API响应数据...');
        const mockResult = {
          success: true,
          files: files.map(file => ({
            filename: file.name,
            size: file.size,
            path: `/contracts/${file.name}`
          }))
        };
        
        if (mockResult.success) {
          console.log('[模拟] 生成新合同数据...');
          // 确保新合同信息完整且有效
          const newContracts: Contract[] = mockResult.files.map((file: any, index: number) => {
            const riskCount = {
              high: Math.floor(Math.random() * 3), // 0-2个高风险
              medium: Math.floor(Math.random() * 5) + 1, // 1-5个中风险
              low: Math.floor(Math.random() * 4) + 1, // 1-4个低风险
            };
            
            return {
              id: `contract-${Date.now()}-${index}`,
              name: file.filename || file.name,
              type: type as ContractType,
              standard: standard as ContractStandard,
              uploadDate: new Date().toISOString(),
              fileUrl: savedFilePaths[index] || `/contracts/${file.filename || file.name}`, // 使用实际保存的路径，如果不存在则使用默认路径
              fileSize: formatFileSize(file.size || 0),
              status: "analyzing" as const,
              riskCount: riskCount,
            };
          }).filter(contract => 
            contract.id && 
            contract.name && 
            contract.fileUrl && 
            contract.type && 
            contract.standard
          );
          
          if (newContracts.length === 0) {
            throw new Error('没有有效的合同信息可以添加到列表');
          }
          
          console.log(`[模拟] 已生成 ${newContracts.length} 个新合同，准备更新列表`);
          // 刷新合同列表 - 添加新合同并重新排序
          setContracts(prevContracts => {
            const updatedContracts = [...newContracts, ...prevContracts];
            console.log(`[模拟] 合同列表已更新，现在共有 ${updatedContracts.length} 个合同`);
            return updatedContracts;
          });
          
          // 为每个新合同模拟分析完成
          newContracts.forEach(contract => {
            console.log(`- 合同: ${contract.name} (ID: ${contract.id}) 正在分析中`);
            setTimeout(() => {
              setContracts(prevContracts =>
                prevContracts.map(c => {
                  if (c.id === contract.id) {
                    // 使用类型断言确保status符合联合类型
                    const updatedContract = { ...c, status: "completed" as const }
                    console.log(`- 合同: ${c.name} (ID: ${c.id}) 分析完成`);
                    // 显示分析完成的提示
                    toast({
                      variant: "default",
                      title: "分析完成",
                      description: `${c.name} 合同分析已完成`,
                      duration: 3000
                    })
                    return updatedContract
                  }
                  return c
                })
              )
            }, Math.random() * 3000 + 2000);
          });
          
          // 显示成功提示
          toast({ 
            variant: "default",
            title: "上传成功", 
            description: `已成功上传 ${newContracts.length} 个合同文件，文件已保存到 /public/contracts 目录` 
          })
          
          // 显示详细的上传结果信息
          console.log('\n[测试信息] 上传结果详情：');
          newContracts.forEach(contract => {
            console.log(`- 合同: ${contract.name} (ID: ${contract.id})`);
            console.log(`  类型: ${contract.type}`);
            console.log(`  标准: ${contract.standard}`);
            console.log(`  存储路径: ${contract.fileUrl}`);
            console.log(`  文件大小: ${contract.fileSize}`);
            console.log(`  上传时间: ${new Date(contract.uploadDate).toLocaleString()}`);
            if (contract.riskCount) {
              console.log(`  初始风险统计: 高=${contract.riskCount.high}, 中=${contract.riskCount.medium}, 低=${contract.riskCount.low}`);
            }
            if (contract.status) {
              console.log(`  当前状态: ${contract.status}`);
            }
            console.log('-------------------------');
          });
        }
      } catch (error: any) {
        console.error('上传错误:', error);
        setUploadStatus(`上传失败: ${error.message || '未知错误'}`);
        toast({ 
          variant: "destructive",
          title: "上传失败", 
          description: error instanceof Error ? error.message : "文件上传过程中发生错误"
        });
      } finally {
            // 确保无论成功还是失败，都重置上传状态
            setTimeout(() => {
                // 先重置上传相关状态
                setUploading(false)
                setUploadProgress(0)
                setUploadStatus('')
                setFileProgress({}) // 重置文件进度
                
                // 关闭弹窗
                setIsUploadDialogOpen(false) // 上传完成后立即关闭弹窗
                
                // 重置新合同数据，准备下一次上传
                setNewContract({ type: '', standard: '', files: [] })
                
                console.log('[模拟] 上传状态已完全重置');
            }, 1000); // 成功后等待1秒即可，提供良好的用户体验
      }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContracts(filteredContracts.map((c) => c.id))
    } else {
      setSelectedContracts([])
    }
  }

  const handleSelectContract = (contractId: string, checked: boolean) => {
    if (checked) {
      setSelectedContracts([...selectedContracts, contractId])
    } else {
      setSelectedContracts(selectedContracts.filter((id) => id !== contractId))
    }
  }

  const handleReAudit = (contractId: string) => {
    setContracts(contracts.map((c) => (c.id === contractId ? { ...c, status: "analyzing" as const } : c)))
  }

  const handleDelete = (contractId: string) => {
    setContracts(contracts.filter((c) => c.id !== contractId))
    setSelectedContracts(selectedContracts.filter((id) => id !== contractId))
  }

  const handleExport = () => {
    const selectedData = contracts.filter((c) => selectedContracts.includes(c.id) && c.status === "completed")

    if (selectedData.length === 0) {
      alert("请选择已完成审核的合同")
      return
    }

    const headers = [
      "合同名称",
      "合同类型",
      "合同标准",
      "上传时间",
      "文件大小",
      "处理状态",
      "高风险",
      "中风险",
      "低风险",
    ]
    const rows = selectedData.map((c) => [
      c.name,
      c.type === "wind-turbine" ? "风机" : "储能",
      c.standard === "standard" ? "标准" : "非标",
      new Date(c.uploadDate).toLocaleString("zh-CN"),
      c.fileSize,
      "已完成",
      (c.riskCount?.high ?? 0).toString(),
      (c.riskCount?.medium ?? 0).toString(),
      (c.riskCount?.low ?? 0).toString(),
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `合同审核结果_${new Date().toLocaleDateString()}.csv`
    link.click()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const getContractTypeName = (type: ContractType) => {
    return type === "wind-turbine" ? "风机" : "储能"
  }

  const getContractStandardName = (standard: ContractStandard) => {
    return standard === "standard" ? "标准" : "非标"
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">合同处理列表</h1>
          <p className="mt-2 text-muted-foreground">查看上传历史、处理状态以及分析结果</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={refreshContracts}
            variant="secondary"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            刷新列表
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                上传合同
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>上传新合同</DialogTitle>
                <DialogDescription>上传Word或PDF格式的合同文档，系统将自动进行风险识别分析</DialogDescription>
              </DialogHeader>
              {uploading && (
                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-200 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="contract-type">
                  合同类型 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newContract.type}
                  onValueChange={(value: ContractType) => setNewContract({ ...newContract, type: value })}
                >
                  <SelectTrigger id="contract-type">
                    <SelectValue placeholder="请选择合同类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wind-turbine">风机合同</SelectItem>
                    <SelectItem value="energy-storage">储能合同</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract-standard">
                  合同标准 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newContract.standard}
                  onValueChange={(value: ContractStandard) => setNewContract({ ...newContract, standard: value })}
                >
                  <SelectTrigger id="contract-standard">
                    <SelectValue placeholder="请选择合同标准" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准合同</SelectItem>
                    <SelectItem value="non-standard">非标合同</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload">上传文件</Label>
                <div 
                className={`flex items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 hover:border-primary hover:bg-muted'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label htmlFor="file-upload" className="cursor-pointer text-center">
                  <Upload className={`mx-auto h-12 w-12 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="mt-2 text-sm font-medium text-foreground">点击上传或拖拽文件到此处</p>
                  <p className="mt-1 text-xs text-muted-foreground">支持 .docx, .pdf 格式，支持批量上传</p>
                  {newContract.files.length > 0 && (
                    <div className="mt-2 text-xs text-primary">
                      <p>已选择 {newContract.files.length} 个文件:</p>
                      <div className="mt-1 max-h-36 overflow-y-auto">
                        {newContract.files.map((file, index) => (
                          <div key={index} className="mb-2">
                            <div className="flex justify-between text-left mb-1">
                              <span className="truncate">{file.name}</span>
                              {uploading && fileProgress[file.name] !== undefined && (
                                <span className="text-xs text-primary">{fileProgress[file.name]}%</span>
                              )}
                            </div>
                            {uploading && fileProgress[file.name] !== undefined && (
                              <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-200 ease-out" 
                                  style={{ width: `${fileProgress[file.name]}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".docx,.pdf"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={uploading}
                >
                  取消
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!newContract.type || !newContract.standard || newContract.files.length === 0 || uploading}
                >
                  {uploading ? "上传中..." : "开始上传"}
                </Button>
              </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索合同名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center">已选 {selectedContracts.length} 条</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={selectedContracts.length === 0}
              className="gap-2 bg-transparent"
            >
              结果导出
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedContracts.length === filteredContracts.length && filteredContracts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>合同名称</TableHead>
                <TableHead>合同类型</TableHead>
                <TableHead>合同标准</TableHead>
                <TableHead>上传时间</TableHead>
                <TableHead>文件大小</TableHead>
                <TableHead>处理状态</TableHead>
                <TableHead>风险统计</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.sort((a, b) => 
                new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
              ).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="mb-2 h-8 w-8" />
                      <p>暂无合同数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContracts.includes(contract.id)}
                        onCheckedChange={(checked) => handleSelectContract(contract.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="max-w-md truncate">{contract.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getContractTypeName(contract.type)}</TableCell>
                    <TableCell>{getContractStandardName(contract.standard)}</TableCell>
                    <TableCell>{formatDateTime(contract.uploadDate)}</TableCell>
                    <TableCell>{contract.fileSize}</TableCell>
                    <TableCell>
                      {contract.status === "completed" ? (
                        <Badge className="gap-1 bg-success text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          已完成
                        </Badge>
                      ) : contract.status === "analyzing" ? (
                        <Badge className="gap-1 bg-warning text-white">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          审核中
                        </Badge>
                      ) : (
                        <Badge variant="secondary">待处理</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {contract.status === "completed" && contract.riskCount && (
                        <div className="flex gap-1">
                          <Badge variant="destructive" className="px-1 py-0 text-xs">
                            高: {contract.riskCount.high}
                          </Badge>
                          <Badge variant="default" className="px-1 py-0 text-xs">
                            中: {contract.riskCount.medium}
                          </Badge>
                          <Badge variant="secondary" className="px-1 py-0 text-xs">
                            低: {contract.riskCount.low}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {contract.status === "completed" && (
                          <Link href={`/contracts/${contract.id}/results`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <FileCheck className="h-4 w-4" />
                              查看结果
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1" 
                          onClick={() => handleReAudit(contract.id)}
                          disabled={contract.status === "analyzing"}
                        >
                          <RefreshCw className="h-4 w-4" />
                          重新审核
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1" title="下载原始合同">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(contract.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          删除
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
