// src/components/PersonalizedArticle.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface PersonalizedArticleProps {
  html: string;
  className?: string;
}

/**
 * Replaces {{name}} or {{name|default}} placeholders with the provided name.
 * @param text - The text containing placeholders
 * @param recipientName - The name from URL parameter (optional)
 * @returns The text with placeholders replaced
 *
 * Examples:
 * - replaceName("Hi {{name}}", "Alice") => "Hi Alice"
 * - replaceName("Hi {{name}}", null) => "Hi friend"
 * - replaceName("Hi {{name|buddy}}", null) => "Hi buddy"
 * - replaceName("Hi {{name|buddy}}", "Alice") => "Hi Alice"
 */
export function replaceName(text: string, recipientName: string | null): string {
  // Regex matches: {{name}} or {{name|defaultValue}}
  // Capture group 1: the default value (if provided, can be empty)
  const pattern = /\{\{name(?:\|([^}]*))?\}\}/g;

  return text.replace(pattern, (match, inlineDefault) => {
    // Priority: recipientName > inlineDefault > global fallback "friend"
    // Note: empty string defaults are intentional, so we check explicitly for null/undefined
    if (recipientName) return recipientName;
    if (inlineDefault !== undefined) return inlineDefault;
    return 'friend';
  });
}

export default function PersonalizedArticle({ html, className = '' }: PersonalizedArticleProps) {
  const articleRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  useEffect(() => {
    if (!articleRef.current) return;

    // Get the recipient name from URL params (trim whitespace)
    const recipientName = name?.trim() || null;

    // Walk through all text nodes and replace placeholders
    const walker = document.createTreeWalker(
      articleRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: { node: Text; newValue: string }[] = [];

    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      const textNode = currentNode as Text;
      const originalValue = textNode.nodeValue || '';

      // Check if this text node contains any placeholder pattern
      if (/\{\{name(?:\|[^}]+)?\}\}/.test(originalValue)) {
        const newValue = replaceName(originalValue, recipientName);
        nodesToReplace.push({
          node: textNode,
          newValue
        });
      }
    }

    // Apply replacements
    nodesToReplace.forEach(({ node, newValue }) => {
      node.nodeValue = newValue;
    });
  }, [name]);

  return (
    <article
      ref={articleRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
