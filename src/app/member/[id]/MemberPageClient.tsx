'use client';

import { useParams } from 'next/navigation';
import { useFamilyStore } from '@/lib/family-store';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { MemberProfile } from '@/components/members/MemberProfile';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MemberPageClient() {
  const { id } = useParams<{ id: string }>();
  const member = useFamilyStore((s) => s.getMemberById(id));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <SearchBar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/tree">
          <Button variant="ghost" size="sm" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Tree
          </Button>
        </Link>

        {member ? (
          <MemberProfile member={member} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Member not found</p>
            <Link href="/tree">
              <Button className="mt-4">Go to Family Tree</Button>
            </Link>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
