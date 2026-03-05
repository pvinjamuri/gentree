'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useFamilyStore } from '@/lib/family-store';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { calculateAge, getLifeSpan } from '@/lib/date-utils';

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const members = useFamilyStore((s) => s.members);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search family members..." />
      <CommandList>
        <CommandEmpty>No members found.</CommandEmpty>
        <CommandGroup heading="Family Members">
          {members.map((member) => (
            <CommandItem
              key={member.id}
              value={member.name}
              onSelect={() => {
                router.push(`/member/${member.id}`);
                setOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <MemberAvatar member={member} size="sm" />
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">
                  {getLifeSpan(member.dateOfBirth, member.dateOfDeath)}
                  {member.location && ` • ${member.location}`}
                </p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
