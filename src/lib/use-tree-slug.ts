'use client';

import { useParams } from 'next/navigation';

// Extract tree slug from URL path: /tree/[slug], /tree/[slug]/member/[id], etc.
export function useTreeSlug(): string {
  const params = useParams<{ slug: string }>();
  return params.slug || '';
}
