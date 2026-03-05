'use client';

import { FamilyMember } from '@/lib/types';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { calculateAge, getLifeSpan, getDaysUntilBirthday } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface SearchResultsProps {
  results: FamilyMember[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No members found</p>
        {query && <p className="text-sm mt-1">Try a different search term</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((member) => {
        const age = calculateAge(member.dateOfBirth, member.dateOfDeath);
        const daysUntilBday = getDaysUntilBirthday(member.dateOfBirth);
        const isDeceased = !!member.dateOfDeath;

        return (
          <Link key={member.id} href={`/member/${member.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <MemberAvatar member={member} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {getLifeSpan(member.dateOfBirth, member.dateOfDeath)}
                    </p>
                    {age !== null && (
                      <p className="text-xs text-gray-400">
                        {isDeceased ? `Lived ${age} years` : `Age ${age}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isDeceased && <Badge variant="outline" className="text-xs">Deceased</Badge>}
                    {!isDeceased && daysUntilBday !== null && daysUntilBday <= 30 && (
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                        🎂 {daysUntilBday === 0 ? 'Today!' : `${daysUntilBday}d`}
                      </Badge>
                    )}
                  </div>
                </div>
                {member.location && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {member.location}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
