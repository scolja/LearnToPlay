'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useState } from 'react';

export function RevertButton({ slug, versionId }: { slug: string; versionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRevert = async () => {
    if (!confirm('Revert to this version? This will create a new version with this content.')) return;

    setLoading(true);
    try {
      const res = await apiFetch(`/api/guides/${slug}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Revert failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleRevert} disabled={loading}>
      {loading ? 'Reverting...' : 'Revert'}
    </button>
  );
}
