"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

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
import { Upload, FileText, Search, Download, Trash2, RefreshCw, FileCheck, CheckCircle2, FileWarning, FileX, Loader2, FilePlus, X } from "lucide-react"
import { mockContracts } from "@/lib/mock-data"
import type { Contract, ContractType, ContractStandard } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [newContract, setNewContract] = useState({ type: '', standard: '', files: [] } as { type: string, standard: string, files: File[] })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [fileProgress, setFileProgress] = useState<{[key: string]: number}>({})
  const [fileStatus, setFileStatus] = useState<{[key: string]: 'idle' | 'uploading' | 'success' | 'error'}>({})
  const [fileErrors, setFileErrors] = useState<{[key: string]: string}>({})
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 从API获取合同数据
  const fetchContracts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/contracts')
      if (response.ok) {
        const data = await response.json()
        setContracts(data.data )
      }
    } catch (error) {
      console.error('获取合同列表失败:', error)
      toast({
        variant: "destructive",
        title: "获取数据失败",
        description: "无法加载合同列表，请稍后重试",
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 初始化加载数据
  useEffect(() => {
    fetchContracts()
  }, [])
  
  // 刷新合同列表
  const refreshContracts = () => {
    setRefreshing(true);
    fetchContracts().finally(() => setRefreshing(false));
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || contract.type === filterType
    return matchesSearch && matchesType
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      validateAndAddFiles(files)
    }
  }
  
  // 验证并添加文件
  const validateAndAddFiles = (files: File[]) => {
    const validFiles: File[] = []
    const errors: {[key: string]: string} = {}
    
    files.forEach(file => {
      // 验证文件类型
      const validExtensions = ['pdf', 'docx']
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      
      if (!validExtensions.includes(fileExt || '')) {
        errors[file.name] = '仅支持 PDF 和 Word (.docx) 文件'
        return
      }
      
      // 验证文件大小（50MB限制）
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        errors[file.name] = '文件大小不能超过 50MB'
        return
      }
      
      validFiles.push(file)
    })
    
    // 更新文件列表
    if (validFiles.length > 0) {
      setNewContract(prev => ({ 
        ...prev, 
        files: [...prev.files, ...validFiles] 
      }))
      
      // 初始化文件状态
      const newFileStatus: {[key: string]: 'idle'} = {}
      validFiles.forEach(file => {
        newFileStatus[file.name] = 'idle'
      })
      setFileStatus(prev => ({ ...prev, ...newFileStatus }))
    }
    
    // 显示错误
    if (Object.keys(errors).length > 0) {
      setFileErrors(prev => ({ ...prev, ...errors }))
      Object.entries(errors).forEach(([fileName, error]) => {
        toast({
          variant: "destructive",
          title: `文件 ${fileName} 无效`,
          description: error,
          duration: 3000
        })
      })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  // 处理拖放事件
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles);
    }
  };
  
  // 已经在前面定义了handleDragOver函数，移除重复定义
  
  // 处理文件选择
  const handleFileSelection = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                          file.name.endsWith('.docx');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB 限制
      
      if (!isValidType) {
        setFileErrors(prev => ({
          ...prev,
          [file.name]: '只支持PDF和Word文档格式'
        }));
        return false;
      }
      
      if (!isValidSize) {
        setFileErrors(prev => ({
          ...prev,
          [file.name]: '文件大小不能超过20MB'
        }));
        return false;
      }
      
      return true;
    });
    
    // 过滤掉已存在的文件
    const newFiles = validFiles.filter(newFile => 
      !newContract.files.some(existingFile => existingFile.name === newFile.name)
    );
    
    setNewContract(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
    
    // 初始化新文件的上传进度
    const newFileProgress = { ...fileProgress };
    newFiles.forEach(file => {
      newFileProgress[file.name] = 0;
    });
    setFileProgress(newFileProgress);
    
    // 显示添加成功提示
    if (newFiles.length > 0) {
      toast({
        variant: "default",
        title: "文件已添加",
        description: `已添加 ${newFiles.length} 个文件到上传队列`,
        duration: 2000
      });
    }
  };
  
  // 移除重复的removeFile函数，保留正确的实现
  // 移除文件
  const removeFile = (index: number) => {
    if (uploading) return;
    const updatedFiles = [...newContract.files];
    const fileName = updatedFiles[index].name;
    updatedFiles.splice(index, 1);
    
    setNewContract(prev => ({
      ...prev,
      files: updatedFiles
    }));
    
    // 更新进度和错误状态
    setFileProgress(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
    
    setFileErrors(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
    
    setFileStatus(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };
  
  // 获取上传状态样式
  const getStatusStyle = (progress: number, error: string | undefined) => {
    if (error) return 'text-destructive';
    if (progress === 100) return 'text-success';
    return 'text-primary';
  };
  
  // 处理文件上传
  const handleUpload = async () => {
    const { files, type, standard } = newContract
    
    // 验证输入
    if (!files || files.length === 0) {
      toast({ title: "请选择至少一个文件", variant: "destructive" })
      return
    }
    
    if (!type || type.trim() === '') {
      toast({ title: "请选择合同类型", variant: "destructive" })
      return
    }
    
    if (!standard || standard.trim() === '') {
      toast({ title: "请选择合同标准", variant: "destructive" })
      return
    }
    
    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('正在准备上传...')
    
    // 初始化文件进度和状态
    const initialFileProgress: {[key: string]: number} = {}
    const initialFileStatus: {[key: string]: 'uploading'} = {}
    
    files.forEach(file => {
      initialFileProgress[file.name] = 0
      initialFileStatus[file.name] = 'uploading'
    })
    
    setFileProgress(initialFileProgress)
    setFileStatus(initialFileStatus)
    
    try {
      // 创建FormData对象
      const formData = new FormData()
      
      // 添加所有文件
      files.forEach(file => {
        formData.append('files', file)
      })
      
      // 添加其他表单字段
      formData.append('type', type)
      formData.append('standard', standard)
      
      // 使用XMLHttpRequest以获取上传进度
      const xhr = new XMLHttpRequest()
      
      // 模拟进度更新
      let progressInterval: NodeJS.Timeout
      
      // 创建Promise来包装XHR请求
      const uploadPromise = new Promise<void>((resolve, reject) => {
        // 模拟进度更新
        progressInterval = setInterval(() => {
          files.forEach((file) => {
            setFileProgress(prev => {
              const currentProgress = prev[file.name] || 0
              const newProgress = Math.min(currentProgress + (10 / files.length), 95) // 最多到95%，留5%给服务器处理
              
              // 更新整体进度
              const totalProgress = Math.floor(
                Object.values(prev).reduce((sum, val) => sum + val, 0) / files.length
              )
              setUploadProgress(totalProgress)
              setUploadStatus(`正在上传 ${files.length} 个文件... (${totalProgress}%)`)
              
              return { ...prev, [file.name]: newProgress }
            })
          })
        }, 200)
        
        xhr.open('POST', '/api/upload', true)
        
        xhr.onload = () => {
          clearInterval(progressInterval)
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`上传失败: ${xhr.statusText}`))
          }
        }
        
        xhr.onerror = () => {
          clearInterval(progressInterval)
          reject(new Error('网络错误，上传失败'))
        }
        
        xhr.send(formData)
      })
      
      // 等待上传完成
      await uploadPromise
      
      // 设置最终进度
      setUploadProgress(100)
      setUploadStatus('上传完成，正在处理...')
      
      // 所有文件状态设置为成功
      const successStatus: {[key: string]: 'success'} = {}
      files.forEach(file => {
        successStatus[file.name] = 'success'
      })
      setFileStatus(successStatus)
      
      // 重新获取合同列表
      await fetchContracts()
      
      toast({ 
        variant: "default",
        title: "上传成功", 
        description: `已成功上传 ${files.length} 个合同文件` 
      })
      
    } catch (error: any) {
      console.error('上传错误:', error)
      setUploadStatus(`上传失败`)
      
      // 设置错误状态
      const errorStatus: {[key: string]: 'error'} = {}
      files.forEach(file => {
        errorStatus[file.name] = 'error'
      })
      setFileStatus(prev => ({ ...prev, ...errorStatus }))
      
      toast({ 
        variant: "destructive",
        title: "上传失败", 
        description: error instanceof Error ? error.message : "文件上传过程中发生错误"
      })
    } finally {
      // 重置状态
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        setUploadStatus('')
        setFileProgress({})
        setFileStatus({})
        setFileErrors({})
        setIsUploadDialogOpen(false)
        setNewContract({ type: '', standard: '', files: [] })
      }, 1500)
    }
  }
  
  // 注意：移除了重复的handleFileChange和validateAndAddFiles函数，保留handleFileSelection
  // 移除第二个重复的removeFile函数

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

  const handleDelete = async (id: string) => {
    try {
      // 添加详细调试日志
      console.log('handleDelete函数被调用，ID:', id);
      console.log('ID类型:', typeof id);
      console.log('ID长度:', id.length);
      
      const url = `/api/contracts/${id}`;
      console.log('DELETE请求URL:', url);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('DELETE请求响应状态:', res.status);
      console.log('响应头:', Object.fromEntries(res.headers));
      
      // 安全解析响应体，处理可能的JSON解析错误
      let responseData = {};
      try {
        responseData = await res.json();
        console.log('DELETE请求响应数据:', responseData);
      } catch (jsonError) {
        console.error('解析响应数据时出错:', jsonError);
        console.log('原始响应文本:', await res.text());
      }
      
      if (!res.ok) {
        console.error('删除合同失败响应:', { 
          status: res.status, 
          data: responseData || '无法解析响应数据' 
        });
        const errorMessage = responseData && typeof responseData === 'object' && 'message' in responseData 
          ? responseData.message 
          : `删除合同失败 (状态码: ${res.status})`;
        throw new Error(String(errorMessage));
      }
            // 显示成功提示
      toast({
        variant: "default",
        title: "删除成功",
        description: "合同已成功删除",
        duration: 300
      });
      // 更新本地状态
      setContracts(contracts.filter(contract => contract.id !== id));
      setSelectedContracts(selectedContracts.filter(contractId => contractId !== id));
      

    } catch (error) {
      console.error('删除合同错误:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : "无法删除合同，请稍后重试",
        duration: 3000
      });
    }
  };

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
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                刷新中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                刷新列表
              </>
            )}
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                上传合同
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>上传合同</DialogTitle>
                <DialogDescription>
                  支持PDF和Word文档批量上传，单个文件大小不超过20MB
                </DialogDescription>
              </DialogHeader>
              
              {/* 文件上传区域 */}
              <div 
                className={`mt-4 mb-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FilePlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">拖拽文件到此处或点击上传</h3>
                <p className="text-sm text-muted-foreground mb-4">支持 .pdf 和 .docx 格式，单个文件最大20MB</p>
                <Button variant="secondary">
                  选择文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  onChange={(e) => e.target.files && handleFileSelection(Array.from(e.target.files))}
                  className="hidden"
                />
              </div>
              
              {/* 已选择文件列表 */}
              {newContract.files.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">已选择 {newContract.files.length} 个文件</h3>
                  <div className="space-y-2">
                    {newContract.files.map((file, index) => {
                      const progress = fileProgress[file.name] || 0;
                      const error = fileErrors[file.name];
                      const status = fileStatus[file.name] || 'idle';
                      return (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {file.type === 'application/pdf' ? (
                                  <FileText className="h-4 w-4 text-red-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="truncate font-medium">{file.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${error ? 'bg-destructive' : 'bg-primary'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${getStatusStyle(progress, error)} whitespace-nowrap`}>
                                {error ? '上传失败' : progress === 100 ? '已完成' : `${progress}%`}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeFile(index)}
                                disabled={uploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {error && (
                              <p className="text-xs text-destructive mt-1">{error}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 整体上传进度 */}
              {uploading && (
                <div className="mb-4 space-y-2">
                  <Alert>
                    <AlertTitle>上传进度</AlertTitle>
                    <AlertDescription>{uploadStatus}</AlertDescription>
                  </Alert>
                  <Progress value={uploadProgress} />
                </div>
              )}
              
              {/* 合同信息表单 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contract-type">合同类型 <span className="text-destructive">*</span></Label>
                  <Select
                    value={newContract.type}
                    onValueChange={(value) => setNewContract(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="contract-type">
                      <SelectValue placeholder="选择合同类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wind-turbine">风机</SelectItem>
                      <SelectItem value="energy-storage">储能</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contract-standard">合同标准 <span className="text-destructive">*</span></Label>
                  <Select
                    value={newContract.standard}
                    onValueChange={(value) => setNewContract(prev => ({ ...prev, standard: value }))}
                  >
                    <SelectTrigger id="contract-standard">
                      <SelectValue placeholder="选择合同标准" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">标准</SelectItem>
                      <SelectItem value="non-standard">非标</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 上传操作按钮 */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    if (!uploading) {
                      setIsUploadDialogOpen(false)
                      setNewContract({ type: '', standard: '', files: [] })
                      setFileErrors({})
                      setUploadProgress(0)
                      setFileProgress({})
                      setFileStatus({})
                    }
                  }} 
                  disabled={uploading}
                >
                  取消
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !newContract.files.length || !newContract.type || !newContract.standard}
                  className="gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      上传 ({newContract.files.length})
                    </>
                  )}
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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-transparent"
            >
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <div className="animate-spin">
                        <RefreshCw className="h-8 w-8" />
                      </div>
                      <p>正在加载合同数据...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContracts.sort((a, b) => 
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
