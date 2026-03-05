'use client';

import { useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { SearchBar } from '@/components/search/SearchBar';
import { PosterLayout } from '@/components/pdf/PosterLayout';
import { PdfExportButton } from '@/components/pdf/PdfExportButton';
import { InviteLinkGenerator } from '@/components/share/InviteLinkGenerator';
import { useFamilyStore } from '@/lib/family-store';

export default function PrintPage() {
  const posterRef = useRef<HTMLDivElement>(null);
  const members = useFamilyStore((s) => s.members);
  const relationships = useFamilyStore((s) => s.relationships);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <SearchBar />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Print Family Tree</h1>
            <p className="text-gray-500 text-sm">
              Preview and download your family tree as a printable PDF poster
            </p>
          </div>
          <PdfExportButton targetRef={posterRef} />
        </div>

        {/* Poster preview */}
        <div className="border rounded-lg bg-white shadow-sm overflow-auto max-h-[60vh]">
          <PosterLayout
            ref={posterRef}
            members={members}
            relationships={relationships}
          />
        </div>

        {/* Invite section */}
        <div className="max-w-md mx-auto">
          <InviteLinkGenerator />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
