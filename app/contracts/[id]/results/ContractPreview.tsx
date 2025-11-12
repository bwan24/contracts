"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { mockContractAnalysis, mockContracts } from "@/lib/mock-data"
import { MarkdownViewer, type MarkdownViewerRef } from "@/components/markdown-viewer"
// @ts-ignore
import FileViewer from 'react-file-viewer';

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
    console.log('开始加载合同预览，合同ID:', contractId);
    // 直接从mock数据中查找合同
    let foundContract = mockContracts.find(c => c.id === contractId);
    
    // 如果没有找到合同，创建一个测试用的默认合同，优先使用public/contracts目录下的实际文件
    if (!foundContract) {
      console.log('未找到合同，使用测试合同数据');
      // 检查是否存在11.docx或12.docx文件
      const testFiles = ['12.docx', '11.docx'];
      let testFileName = testFiles[0]; // 默认使用12.docx
      
      // 创建一个测试合同，文件路径指向public/contracts目录下的实际文件
      foundContract = {
        id: contractId,
        name: testFileName,
        type: 'wind-turbine',
        standard: 'standard',
        uploadDate: new Date().toISOString(),
        fileUrl: `/contracts/${encodeURIComponent(testFileName)}`,
        fileSize: '1.2 MB',
        status: 'completed',
        riskCount: { high: 1, medium: 2, low: 3 }
      };
      console.log('测试合同路径:', foundContract.fileUrl);
      console.log('对应实际文件路径:', `public/contracts/${testFileName}`);
    }
    
    if (foundContract) {
      console.log('合同信息已设置:', { id: foundContract.id, name: foundContract.name, fileUrl: foundContract.fileUrl });
      setContract(foundContract);
      setFileName(foundContract.name);
      setError(null);
      
      // 根据文件类型设置不同的处理逻辑
      if (foundContract.name.endsWith('.docx')) {
        setIsLoading(true);
        // 确保使用正确的public/contracts路径
        const docxUrl = `/contracts/${encodeURIComponent(foundContract.name)}`;
        console.log('尝试加载Word文档:', docxUrl);
        console.log('实际文件路径应该是: public/contracts/' + foundContract.name);
        
        setFileUrl(docxUrl);
        setIsLoading(false);
      } else if (foundContract.name.endsWith('.pdf')) {
          console.log('检测到PDF文件，使用iframe预览:', foundContract.name);
          setIsLoading(true);
          // 如果是PDF文件，使用更安全的路径处理
          // 直接使用合同名称作为文件名
          const pdfFileName = foundContract.name;
          // 尝试多个可能的PDF路径，优先使用public/contracts目录
          const possibleUrls = [
            `/contracts/${encodeURIComponent(pdfFileName)}`,  // public/contracts目录
            `/pdfs/${pdfFileName}`,
            `/static/contracts/${pdfFileName}`
          ];
          console.log('尝试PDF路径列表:', possibleUrls);
          console.log('首选路径对应文件: public/contracts/' + pdfFileName);
          
          // 尝试加载第一个可用的PDF
          const tryLoadPdf = async () => {
            for (const url of possibleUrls) {
              try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                  setFileUrl(url);
                  return;
                }
              } catch (err) {
                console.log(`PDF路径不可用: ${url}`);
              }
            }
            // 如果所有路径都失败，使用在线PDF示例作为备用
            setFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            console.warn('使用在线示例PDF作为替代');
          };
          
          tryLoadPdf().finally(() => {
            setIsLoading(false);
          });
        } else {
          // 非PDF和非Word文件，使用在线示例PDF作为通用预览
          setIsLoading(true);
          setFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
          setIsLoading(false);
        }
    } else {
      console.warn(`未找到ID为${contractId}的合同`);
      // 设置默认值，防止界面空白
      setFileName('未找到合同');
      setError('未找到合同信息');
    }
  }, [contractId]);
  
  // 从public/jsons/contents文件夹加载markdown内容
  useEffect(() => {
    if (fileName) {
      const loadMarkdownContent = async () => {
        setIsLoadingMarkdown(true);
        try {
          // 构建JSON文件路径，使用合同名称作为文件名
          const jsonFileName = `${fileName}.json`;
          const jsonFilePath = `/jsons/contents/${encodeURIComponent(jsonFileName)}`;
          console.log('尝试加载markdown内容:', jsonFilePath);
          
          const response = await fetch(jsonFilePath);
          if (response.ok) {
            const data = await response.json();
            setMarkdownContent(data.content || "未找到Markdown内容");
            console.log('成功加载markdown内容');
          } else {
            console.warn(`未找到对应的markdown文件: ${jsonFilePath}`);
            setMarkdownContent(`# 未找到对应的Markdown文件\n\n文件名: ${jsonFileName}`);
          }
        } catch (err) {
          console.error('加载markdown内容失败:', err);
          setMarkdownContent("加载Markdown内容失败，请检查文件路径是否正确");
        } finally {
          setIsLoadingMarkdown(false);
        }
      };
      
      loadMarkdownContent();
    }
  }, [fileName]);
  
  // 检查文件是否为Word文件
  const isWordFile = fileName?.endsWith('.docx') || false;
  // 检查文件是否为PDF文件
  const isPdfFile = fileName?.endsWith('.pdf') || false;
  
  return (
    <div className="flex gap-4">
      <Card className="p-4 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <div>
           <h2 className="text-xl font-semibold">{isWordFile ? 'Word预览' : isPdfFile ? 'PDF预览' : '文件预览'}</h2>
           <p className="text-sm text-muted-foreground">{fileName || '未知文件'}</p>
          </div>
         
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => {
            console.log('打开文件:', fileUrl);
            window.open(fileUrl, '_blank');
             }}>
              <ExternalLink className="w-4 h-4" />
              新窗口打开
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => {
              const link = document.createElement('a');
              link.href = fileUrl;
              link.click();
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
                  const targetUrl = isWordFile ? `/contracts/${encodeURIComponent(fileName || '')}` : (fileUrl || '');
              console.log('在新窗口打开:', targetUrl);
                  console.log('对应文件路径:', isWordFile ? 'public/contracts/' + fileName : '');
                  window.open(targetUrl, '_blank');
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
                    {fileUrl && (
                      <FileViewer
                        fileType="docx"
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
                            <p className="text-sm text-red-500 mb-4">无法预览Word文档</p>
                            <Button variant="default" size="sm" onClick={() => {
                              window.open(fileUrl, '_blank');
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
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-sm text-gray-600">正在加载PDF文件...</span>
                        </div>
                      </div>
                    )}
                    {fileUrl && fileUrl.trim() ? (
                      <iframe 
                        src={fileUrl} 
                        className={`w-full h-full border-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
                        title={`${fileName} 预览`}
                        sandbox="allow-same-origin allow-scripts"
                        onLoad={() => {
                          if (!isLoading) return;
                          setIsLoading(false);
                        }}
                        onError={(e) => {
                          setIsLoading(false);
                          setError('PDF加载失败，已尝试备用链接');
                          console.error('PDF iframe加载错误:', e);
                        }}
                      />
                    ) : null}
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
