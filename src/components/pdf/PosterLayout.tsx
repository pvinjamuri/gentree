'use client';

import { forwardRef } from 'react';
import { FamilyMember, Relationship } from '@/lib/types';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { getLifeSpan, calculateAge } from '@/lib/date-utils';

interface PosterLayoutProps {
  members: FamilyMember[];
  relationships: Relationship[];
  familyName?: string;
}

export const PosterLayout = forwardRef<HTMLDivElement, PosterLayoutProps>(
  function PosterLayout({ members, relationships, familyName = 'Sharma' }, ref) {
    // Group members by generation
    const generations = new Map<number, FamilyMember[]>();
    members.forEach((m) => {
      if (!generations.has(m.generation)) {
        generations.set(m.generation, []);
      }
      generations.get(m.generation)!.push(m);
    });

    const sortedGens = Array.from(generations.entries()).sort((a, b) => a[0] - b[0]);

    const genLabels: Record<number, string> = {
      0: 'Great-Grandparents',
      1: 'Grandparents',
      2: 'Parents',
      3: 'Children',
    };

    // Find spouse pairs
    const spousePairs = new Map<string, string>();
    relationships
      .filter((r) => r.type === 'spouse')
      .forEach((r) => {
        spousePairs.set(r.fromMemberId, r.toMemberId);
        spousePairs.set(r.toMemberId, r.fromMemberId);
      });

    // Group members into couples
    function getCouples(genMembers: FamilyMember[]): (FamilyMember | [FamilyMember, FamilyMember])[] {
      const processed = new Set<string>();
      const groups: (FamilyMember | [FamilyMember, FamilyMember])[] = [];

      genMembers.forEach((m) => {
        if (processed.has(m.id)) return;
        processed.add(m.id);

        const spouseId = spousePairs.get(m.id);
        if (spouseId) {
          const spouse = genMembers.find((s) => s.id === spouseId);
          if (spouse && !processed.has(spouse.id)) {
            processed.add(spouse.id);
            groups.push([m, spouse]);
            return;
          }
        }
        groups.push(m);
      });

      return groups;
    }

    return (
      <div
        ref={ref}
        className="bg-white p-8"
        style={{ width: '1200px', minHeight: '800px' }}
      >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-indigo-200">
          <h1 className="text-4xl font-bold text-indigo-700">{familyName} Family Tree</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Generated on {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500">
            <span>{members.length} members</span>
            <span>{sortedGens.length} generations</span>
          </div>
        </div>

        {/* Tree content */}
        <div className="space-y-10">
          {sortedGens.map(([gen, genMembers]) => {
            const couples = getCouples(genMembers);
            return (
              <div key={gen}>
                <div className="text-center mb-4">
                  <span className="text-xs uppercase tracking-wider text-indigo-500 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
                    {genLabels[gen] || `Generation ${gen}`}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {couples.map((item, idx) => {
                    if (Array.isArray(item)) {
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <MemberCard member={item[0]} />
                          <div className="text-yellow-500 text-xl">💛</div>
                          <MemberCard member={item[1]} />
                        </div>
                      );
                    }
                    return <MemberCard key={item.id} member={item} />;
                  })}
                </div>

                {/* Connection lines between generations */}
                {gen < sortedGens[sortedGens.length - 1][0] && (
                  <div className="flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-indigo-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t-2 border-indigo-200">
          <p className="text-gray-400 text-xs">
            Created with Gentree • gentree.app
          </p>
        </div>
      </div>
    );
  }
);

function MemberCard({ member }: { member: FamilyMember }) {
  const isDeceased = !!member.dateOfDeath;
  const age = calculateAge(member.dateOfBirth, member.dateOfDeath);

  return (
    <div
      className={`border-2 rounded-xl p-3 min-w-[160px] text-center ${
        member.gender === 'male'
          ? 'border-blue-300 bg-blue-50'
          : member.gender === 'female'
          ? 'border-pink-300 bg-pink-50'
          : 'border-purple-300 bg-purple-50'
      } ${isDeceased ? 'opacity-75' : ''}`}
    >
      <div className="flex justify-center mb-2">
        <MemberAvatar member={member} size="sm" />
      </div>
      <p className="font-semibold text-sm">{member.name}</p>
      <p className="text-xs text-gray-500">{getLifeSpan(member.dateOfBirth, member.dateOfDeath)}</p>
      {age !== null && (
        <p className="text-xs text-gray-400">
          {isDeceased ? `${age} years` : `Age ${age}`}
        </p>
      )}
      {member.location && (
        <p className="text-xs text-gray-400 mt-0.5">📍 {member.location}</p>
      )}
    </div>
  );
}
