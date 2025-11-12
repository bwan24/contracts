import { createContext, useContext, RefObject } from 'react';
import { MarkdownViewerRef } from '@/components/markdown-viewer';

// 定义Context类型
interface MarkdownHighlightContextType {
  highlightText: (text: string) => void;
  clearHighlight: () => void;
  markdownViewerRef: RefObject<MarkdownViewerRef> | null;
}

// 创建Context
export const MarkdownHighlightContext = createContext<MarkdownHighlightContextType>({
  highlightText: () => {},
  clearHighlight: () => {},
  markdownViewerRef: null
});

// 自定义Hook用于使用高亮功能
export const useMarkdownHighlight = () => useContext(MarkdownHighlightContext);
