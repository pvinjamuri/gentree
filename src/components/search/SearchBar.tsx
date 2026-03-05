'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyStore } from '@/lib/family-store';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { getLifeSpan } from '@/lib/date-utils';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const members = useFamilyStore((s) => s.members);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return members;
    const q = query.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q)
    );
  }, [members, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog */}
      <div className="relative flex justify-center pt-[15vh] px-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search family members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 py-3 text-sm outline-none bg-transparent"
            />
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No members found.</p>
            ) : (
              filtered.map((member) => (
                <button
                  key={member.id}
                  className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => {
                    router.push(`/member/${member.id}`);
                    setOpen(false);
                  }}
                >
                  <MemberAvatar member={member} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {getLifeSpan(member.dateOfBirth, member.dateOfDeath)}
                      {member.location && ` · ${member.location}`}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <span>{filtered.length} members</span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
