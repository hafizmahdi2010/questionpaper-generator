import React, { useMemo } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  source: string;
  className?: string;
}

const normalizeMarkdown = (value: string) => {
  if (!value) return '';

  return value
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    .replace(/\(\s*([^()\n]*(?:\\[a-zA-Z]+|[_^][^()\n]+)[^()\n]*)\s*\)/g, (_, expr: string) => `$${expr.trim()}$`);
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ source, className }) => {
  const normalizedSource = useMemo(() => normalizeMarkdown(source), [source]);

  return (
    <div data-color-mode="light" className={className}>
      <MarkdownPreview
        source={normalizedSource}
        style={{ background: 'transparent', color: 'inherit' }}
        remarkPlugins={[remarkGfm, remarkMath] as any}
        rehypePlugins={[rehypeKatex] as any}
        wrapperElement={{ 'data-color-mode': 'light' } as any}
      />
    </div>
  );
};

export default MarkdownRenderer;