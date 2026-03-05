'use client';

import { FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  member: FamilyMember;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getGenderColor(gender: string): string {
  switch (gender) {
    case 'male':
      return 'bg-blue-100 text-blue-700 ring-blue-300';
    case 'female':
      return 'bg-pink-100 text-pink-700 ring-pink-300';
    default:
      return 'bg-purple-100 text-purple-700 ring-purple-300';
  }
}

export function MemberAvatar({ member, size = 'md', className }: MemberAvatarProps) {
  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        className={cn('rounded-full object-cover ring-2', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold ring-2',
        sizeClasses[size],
        getGenderColor(member.gender),
        className
      )}
    >
      {getInitials(member.name)}
    </div>
  );
}
