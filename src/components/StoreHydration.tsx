'use client';

import { useEffect } from 'react';
import { useFamilyStore } from '@/lib/family-store';

export function StoreHydration() {
  useEffect(() => {
    useFamilyStore.persist.rehydrate();
  }, []);

  return null;
}
