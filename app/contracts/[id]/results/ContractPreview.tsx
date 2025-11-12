"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { MarkdownViewer, type MarkdownViewerRef } from "@/components/markdown-viewer"
import dynamic from 'next/dynamic';
// import type { FileViewerProps } from 'react-file-viewer';

// 动态导入FileViewer，禁用SSR以避免window is not defined错误
const FileViewer = dynamic<any>(() => import('react-file-viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-sm text-muted-foreground">加载查看器组件...</p>
    </div>
  )
});

// 合同数据类型
interface Contract {
  id: string;
  name: string;
  type: string;
  standard: string;
  uploadDate: string;
  fileUrl: string;
  fileSize: string;
  status: string;
  riskCount: any;
  fileType?: string;
}

// 从API获取合同详情
const fetchContractDetail = async (contractId: string): Promise<Contract | null> => {
  try {
    const response = await fetch(`/api/contracts/${contractId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data as Contract;
    } else {
      console.error('获取合同详情失败:', data.message);
      return null;
    }
  } catch (error) {
    console.error('获取合同详情时发生错误:', error);
    return null;
  }
};

interface ContractPreviewProps {
  contractId: string
  markdownViewerRef: React.RefObject<MarkdownViewerRef>
}

export default function ContractPreview({ contractId, markdownViewerRef }: ContractPreviewProps) {
  const [contract, setContract] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("正在加载Markdown内容...");
  const [isLoadingMarkdown, setIsLoadingMarkdown] = useState<boolean>(true);
  
  // 获取合同信息并设置预览文件
  useEffect(() => {
    const loadContractData = async () => {
      console.log('开始加载合同预览，合同ID:', contractId);
      setIsLoading(true);
      setError(null);
      
      try {
        // 从API获取合同详情
        const contractData = await fetchContractDetail(contractId);
        
        if (contractData) {
          console.log('合同信息已从数据库获取:', {
            id: contractData.id,
            name: contractData.name,
            uploadDate: contractData.uploadDate,
            fileSize: contractData.fileSize
          });
          
          setContract(contractData);
          setFileName(contractData.name);
          
          // 使用新的API端点获取文件内容
          const fileApiUrl = `/api/contracts/${contractId}/file`;
          console.log('使用文件API端点:', fileApiUrl);
          setFileUrl(fileApiUrl);
        } else {
          console.warn(`未找到ID为${contractId}的合同`);
          setFileName('未找到合同');
          setError('未找到合同信息');
        }
      } catch (err) {
        console.error('加载合同数据失败:', err);
        setError('加载合同数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContractData();
  }, [contractId]);
  
  // 从数据库加载markdown内容
  useEffect(() => {
    if (contractId) {
      const loadMarkdownContent = async () => {
        setIsLoadingMarkdown(true);
        try {
          // 调用API获取合同详情，包括Markdown内容
          const response = await fetch(`/api/contracts/${contractId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.markdown_content) {
              setMarkdownContent(result.data.markdown_content);
              console.log('成功从数据库加载markdown内容');
            } else {
              setMarkdownContent("# 未找到Markdown内容\n\n该合同可能尚未转换为Markdown格式。");
            }
          } else {
            console.warn(`获取合同详情失败: ${contractId}`);
            setMarkdownContent(`# 获取合同详情失败\n\n无法从服务器获取Markdown内容。`);
          }
        } catch (err) {
          console.error('加载markdown内容失败:', err);
          setMarkdownContent("加载Markdown内容失败，请检查网络连接或服务器状态。");
        } finally {
          setIsLoadingMarkdown(false);
        }
      };
      
      loadMarkdownContent();
    }
  }, [contractId]);
  
  // 更健壮的文件类型检查
  const getFileExtension = (name?: string) => {
    if (!name) return '';
    return name.split('.').pop()?.toLowerCase() || '';
  };
  
  const fileExtension = getFileExtension(fileName);
  const isWordFile = ['docx', 'doc'].includes(fileExtension);
  const isPdfFile = fileExtension === 'pdf';
  
  return (
    <div className="flex gap-4">
      <Card className="p-4 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <div>
           <h2 className="text-xl font-semibold">{isWordFile ? 'Word预览' : isPdfFile ? 'PDF预览' : '文件预览'}</h2>
           <p className="text-sm text-muted-foreground">{fileName || '未知文件'}</p>
           {contract && (
             <div className="mt-1 text-xs text-muted-foreground">
               <span>上传时间: {new Date(contract.uploadDate).toLocaleString()}</span>
               <span className="mx-2">•</span>
               <span>文件大小: {contract.fileSize}</span>
             </div>
           )}
          </div>
         
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => {
            console.log('打开文件:', fileUrl);
            if (typeof window !== 'undefined') {
              window.open(fileUrl, '_blank');
            }
             }}>
               <ExternalLink className="w-4 h-4" />
               新窗口打开
             </Button>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => {
               if (typeof document !== 'undefined') {
                 const link = document.createElement('a');
                 link.href = fileUrl;
                 link.download = fileName || 'contract.pdf';
                 link.click();
               }
             }}>
              下载
           </Button>
           </div>

        </div>
        <div className="relative h-[600px] overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="flex items-center border-b bg-gray-100 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500 w-3 h-3"></span>
              <span className="rounded-full bg-yellow-500 w-3 h-3"></span>
              <span className="rounded-full bg-green-500 w-3 h-3"></span>
            </div>
          </div>
          {/* 根据文件类型显示不同的预览方式 */}
          <div className="absolute inset-0 overflow-hidden">
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-blue-600">正在加载文档...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <Button variant="default" size="sm" onClick={() => {
                  console.log('在新窗口打开:', fileUrl);
                  if (typeof window !== 'undefined') {
                    window.open(fileUrl, '_blank');
                  }
                }}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  在新窗口中打开
                </Button>
              </div>
            )}
            
            {!isLoading && !error && (
              <>
                {isWordFile ? (
                  // 使用react-file-viewer预览Word文件
                  <div className="w-full h-full overflow-y-auto bg-white border-t">
                    {fileUrl && typeof FileViewer !== 'undefined' && (
                      <FileViewer
                        fileType={fileExtension}
                        filePath={fileUrl}
                        errorComponent={
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <div className="mb-4 text-red-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                            </div>
                            <p className="text-sm text-red-500 mb-4">无法预览文档</p>
                            <Button variant="default" size="sm" onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.open(fileUrl, '_blank');
                              }
                            }}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              在新窗口中打开
                            </Button>
                          </div>
                        }
                      />
                    )}
                  </div>
                ) : (
                  // PDF文件预览 - 增强版
                  <div className="w-full h-full bg-gray-50 relative">
                    {fileUrl && fileUrl.trim() ? (
                      <iframe 
                        src={fileUrl} 
                        className="w-full h-full border-0" 
                        title={`${fileName || '文档'} 预览`}
                        sandbox="allow-same-origin allow-scripts"
                        onError={(e) => {
                          setError('文档加载失败');
                          console.error('文档iframe加载错误:', e);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">文件链接不可用</p>
                      </div>
                    )}
                    {error && (
                      <div className="absolute bottom-4 left-4 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm border border-red-200 flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
      <Card className="p-4 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <div>
           <h2 className="text-xl font-semibold">Markdown预览</h2>
           <p className="text-sm text-muted-foreground">用于条款比对与定位的文本识别结果</p>
          </div>
        </div>
        <div className="h-[600px] overflow-y-auto rounded-lg border bg-white p-4 shadow-sm">
          <MarkdownViewer 
            ref={markdownViewerRef}
            content={markdownContent} 
            className="text-sm" 
          />
        </div>
        </Card>
      </div>
  )
  }