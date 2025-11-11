"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface MarkdownViewerProps {
  content: string
  className?: string
}

export interface MarkdownViewerRef {
  highlightAndScrollTo: (text: string) => boolean
  clearHighlight: () => void
}

const MarkdownViewer = forwardRef<MarkdownViewerRef, MarkdownViewerProps>(
  ({ content, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [highlightedContent, setHighlightedContent] = useState<string>(content)
    const [currentHighlight, setCurrentHighlight] = useState<string | null>(null)

    const normalizeForMatch = (text: string): string => {
      return text.replace(/\s+/g, "").toLowerCase()
    }

    const tokeniseForFallback = (text: string): string[] => {
      return text
        .split(/[\s,，。；;:：、\n\r()（）【】『』「」“”"'<>《》]+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
    }

    const { normalizedContent, normalizedIndexMap } = useMemo(() => {
      const chars: string[] = []
      const indexMap: number[] = []

      for (let i = 0; i < content.length; i++) {
        const char = content[i]
        if (!char.match(/\s/)) {
          chars.push(char.toLowerCase())
          indexMap.push(i)
        }
      }

      return {
        normalizedContent: chars.join(""),
        normalizedIndexMap: indexMap,
      }
    }, [content])

    // 查找文本在内容中的位置并高亮
    const highlightAndScrollTo = (searchText: string): boolean => {
      console.log('MarkdownViewer: 开始执行highlightAndScrollTo，搜索文本:', searchText);
      console.log('MarkdownViewer: 内容是否存在:', !!content);
      
      if (!searchText || !content) {
        console.log('MarkdownViewer: 搜索文本或内容为空，返回false');
        return false;
      }

      let normalizedTarget = normalizeForMatch(searchText)
      console.log('MarkdownViewer: 规范化后的目标文本:', normalizedTarget);
      
      if (!normalizedTarget) {
        console.log('MarkdownViewer: 规范化后目标文本为空，返回false');
        return false;
      }

      let normalizedIndex = normalizedContent.indexOf(normalizedTarget)
      console.log('MarkdownViewer: 标准化内容:', normalizedContent.substring(0, 100) + '...');
      console.log('MarkdownViewer: 找到的索引位置:', normalizedIndex);

      if (normalizedIndex === -1) {
        console.log('MarkdownViewer: 未找到精确匹配，尝试分词匹配');
        const tokens = tokeniseForFallback(searchText)
        console.log('MarkdownViewer: 分词结果:', tokens);
        let bestLength = 0
        let bestIndex = -1

        for (const token of tokens) {
          const normalizedToken = normalizeForMatch(token)
          console.log('MarkdownViewer: 当前分词:', token, '规范化后:', normalizedToken);
          if (!normalizedToken) continue

          const tokenIndex = normalizedContent.indexOf(normalizedToken)
          console.log('MarkdownViewer: 分词索引位置:', tokenIndex);
          if (tokenIndex !== -1) {
            const contextRadius = 50
            const start = Math.max(0, tokenIndex - contextRadius)
            const end = Math.min(normalizedContent.length, tokenIndex + normalizedToken.length + contextRadius)
            const candidateLength = end - start

            if (candidateLength > bestLength) {
              bestLength = candidateLength
              bestIndex = start
              normalizedTarget = normalizedContent.slice(start, end)
            }
          }
        }

        if (bestIndex !== -1) {
          normalizedIndex = bestIndex
        }
      }

      if (normalizedIndex === -1) {
        console.log('MarkdownViewer: 未能找到匹配内容，返回false');
        return false;
      }

      const highlightStart = normalizedIndexMap[normalizedIndex]
      const highlightEndIndex = normalizedIndex + normalizedTarget.length - 1
      const highlightEnd = normalizedIndexMap[Math.min(highlightEndIndex, normalizedIndexMap.length - 1)]
      
      console.log('MarkdownViewer: 高亮开始位置:', highlightStart, '结束位置:', highlightEnd);

      if (highlightStart === undefined || highlightEnd === undefined) {
        console.log('MarkdownViewer: 高亮位置计算失败，返回false');
        return false;
      }

      const beforeText = content.slice(0, highlightStart)
      const matchedText = content.slice(highlightStart, highlightEnd + 1)
      const afterText = content.slice(highlightEnd + 1)

      const highlighted = `${beforeText}<mark class="bg-yellow-200 px-1 py-0.5 rounded animate-pulse" id="highlight-target">${matchedText}</mark>${afterText}`
      
      setHighlightedContent(highlighted)
      setCurrentHighlight(matchedText)

      // 首先将整个浏览器页面滚动到顶部 - 移到外层确保总是执行
      // 使用多种滚动方法作为备选，确保兼容性
      console.log('MarkdownViewer: 开始执行浏览器滚动到顶部');
      window.scrollTo(0, 0);
      
      // 备选方案，确保在不同浏览器和环境中都能工作
      if (window.scrollY > 0) {
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
      }
      
      console.log('MarkdownViewer: 浏览器滚动到顶部命令已发送');
      
      // 滚动到高亮位置
      setTimeout(() => {
        console.log('MarkdownViewer: 尝试查找高亮元素');
        const highlightElement = containerRef.current?.querySelector('#highlight-target')
        console.log('MarkdownViewer: 高亮元素是否找到:', !!highlightElement);
        
        if (highlightElement) {
          // 等待一小段时间后处理内部滚动
          setTimeout(() => {
            // 尝试找到ScrollArea的滚动容器
            const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
            
            if (scrollContainer) {
              // 计算元素在容器中的位置
              const elementRect = highlightElement.getBoundingClientRect()
              const containerRect = scrollContainer.getBoundingClientRect()
              const scrollTop = scrollContainer.scrollTop
              
              // 计算目标滚动位置（将元素置于容器中心）
              const targetScrollTop = scrollTop + elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2)
              
              // 平滑滚动
              scrollContainer.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
              })
            } else {
              // 备用方案：使用标准的scrollIntoView
              highlightElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              })
            }
            
            // 添加闪烁效果
            highlightElement.classList.add('animate-bounce')
            setTimeout(() => {
              highlightElement.classList.remove('animate-bounce')
            }, 1000)
          }, 50)
        }
      }, 200)

      return true
    }

    // 清除高亮
    const clearHighlight = () => {
      setHighlightedContent(content)
      setCurrentHighlight(null)
    }

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      highlightAndScrollTo,
      clearHighlight
    }))

    // 当内容变化时重置高亮
    useEffect(() => {
      setHighlightedContent(content)
      setCurrentHighlight(null)
    }, [content])

    return (
      <ScrollArea className={cn("h-full", className)} ref={scrollAreaRef}>
        <div className="p-6" ref={containerRef}>
          <pre 
            className="whitespace-pre-wrap text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      </ScrollArea>
    )
  }
)

MarkdownViewer.displayName = "MarkdownViewer"

export { MarkdownViewer }
