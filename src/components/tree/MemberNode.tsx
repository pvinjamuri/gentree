'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FamilyMember } from '@/lib/types';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { calculateAge, getLifeSpan } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

function getBorderColor(gender: string, isDeceased: boolean): string {
  if (isDeceased) return 'border-gray-400';
  switch (gender) {
    case 'male':
      return 'border-blue-400';
    case 'female':
      return 'border-pink-400';
    default:
      return 'border-purple-400';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MemberNodeComponent({ data }: { data: any }) {
  const member = data.member as FamilyMember;
  if (!member) return null;

  const age = calculateAge(member.dateOfBirth, member.dateOfDeath);
  const lifeSpan = getLifeSpan(member.dateOfBirth, member.dateOfDeath);
  const isDeceased = !!member.dateOfDeath;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-2 !h-2" />
      <div
        className={cn(
          'bg-white rounded-xl border-2 shadow-md px-4 py-3 min-w-[180px] cursor-pointer',
          'hover:shadow-lg transition-shadow duration-200',
          getBorderColor(member.gender, isDeceased),
          isDeceased && 'opacity-80'
        )}
      >
        <div className="flex items-center gap-3">
          <MemberAvatar member={member} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{member.name}</p>
            <p className="text-xs text-gray-500">{lifeSpan}</p>
            {age !== null && (
              <p className="text-xs text-gray-400">
                {isDeceased ? `Lived ${age} years` : `Age ${age}`}
              </p>
            )}
          </div>
        </div>
        {member.location && (
          <p className="text-xs text-gray-400 mt-1 truncate">📍 {member.location}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-2 !h-2" />
    </>
  );
}

export const MemberNode = memo(MemberNodeComponent);
