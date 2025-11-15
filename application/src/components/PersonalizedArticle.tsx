// src/components/PersonalizedArticle.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface PersonalizedArticleProps {
  html: string;
  className?: string;
}

export default function PersonalizedArticle({ html, className = '' }: PersonalizedArticleProps) {
  const articleRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  useEffect(() => {
    if (!articleRef.current) return;

    // Get the recipient name from URL params
    const recipientName = name?.trim();

    if (recipientName) {
      // Walk through all text nodes and replace {{name}} placeholder
      const walker = document.createTreeWalker(
        articleRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      const nodesToReplace: { node: Text; newValue: string }[] = [];

      let currentNode: Node | null;
      while ((currentNode = walker.nextNode())) {
        const textNode = currentNode as Text;
        if (textNode.nodeValue?.includes('{{name}}')) {
          nodesToReplace.push({
            node: textNode,
            newValue: textNode.nodeValue.replace(/\{\{name\}\}/g, recipientName)
          });
        }
      }

      // Apply replacements
      nodesToReplace.forEach(({ node, newValue }) => {
        node.nodeValue = newValue;
      });
    }
  }, [name]);

  return (
    <article
      ref={articleRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
