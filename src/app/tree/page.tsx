'use client';

import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { FamilyTreeCanvas } from '@/components/tree/FamilyTreeCanvas';
import { TreeControls } from '@/components/tree/TreeControls';
import { SearchBar } from '@/components/search/SearchBar';

export default function TreePage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <SearchBar />

      <div className="flex-1 min-h-0 relative">
        <FamilyTreeCanvas />
        <TreeControls />
      </div>

      <MobileNav />
    </div>
  );
}
