'use client';

import { useState, useEffect, useRef } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { mdxComponents } from '@/components';

interface LivePreviewProps {
  content: string;
}

export function LivePreview({ content }: LivePreviewProps) {
  const [compiled, setCompiled] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Preview failed');
          return;
        }

        const data = await res.json();
        setCompiled(data.result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Preview failed');
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content]);

  if (error) {
    return (
      <div className="edit-preview" style={{ color: '#e87070', fontFamily: 'var(--font-ui)', fontSize: '13px', padding: '1rem' }}>
        <strong>Preview Error:</strong> {error}
      </div>
    );
  }

  if (!compiled) {
    return (
      <div className="edit-preview" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '13px', padding: '1rem' }}>
        Loading preview...
      </div>
    );
  }

  return (
    <div className="edit-preview page-wrap">
      <MDXRemote {...compiled} components={mdxComponents} />
    </div>
  );
}
