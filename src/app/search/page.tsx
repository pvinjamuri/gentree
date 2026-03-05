'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchResults } from '@/components/search/SearchResults';
import { useFamilyStore } from '@/lib/family-store';
import { searchMembers, SearchFilters } from '@/lib/search';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const members = useFamilyStore((s) => s.members);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

  const results = useMemo(() => searchMembers(members, filters), [members, filters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <SearchBar />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 bg-white"
            placeholder="Search family members by name, location, or bio..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {results.length} {results.length === 1 ? 'member' : 'members'} found
          </p>
        </div>

        <SearchResults results={results} query={filters.query} />
      </div>

      <MobileNav />
    </div>
  );
}
