'use client';

import { useState, useMemo } from 'react';
import { FamilyMember } from '@/lib/types';
import { useFamilyStore } from '@/lib/family-store';
import { MemberAvatar } from './MemberAvatar';
import { EditMemberModal } from './EditMemberModal';
import { CommentSection } from '@/components/comments/CommentSection';
import { WhatsAppShareButton } from '@/components/share/WhatsAppShareButton';
import { calculateAge, formatDate, getLifeSpan } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  MapPin, Phone, Mail, Calendar, Edit2, Users, Heart,
  UserPlus, Baby,
} from 'lucide-react';
import Link from 'next/link';
import { AddMemberModal } from './AddMemberModal';

interface MemberProfileProps {
  member: FamilyMember;
}

export function MemberProfile({ member }: MemberProfileProps) {
  const getParents = useFamilyStore((s) => s.getParents);
  const getSpouses = useFamilyStore((s) => s.getSpouses);
  const getChildren = useFamilyStore((s) => s.getChildren);
  const getSiblings = useFamilyStore((s) => s.getSiblings);
  const members = useFamilyStore((s) => s.members);
  const relationships = useFamilyStore((s) => s.relationships);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddSpouse, setShowAddSpouse] = useState(false);

  const parents = useMemo(() => getParents(member.id), [getParents, member.id, members, relationships]);
  const spouses = useMemo(() => getSpouses(member.id), [getSpouses, member.id, members, relationships]);
  const children = useMemo(() => getChildren(member.id), [getChildren, member.id, members, relationships]);
  const siblings = useMemo(() => getSiblings(member.id), [getSiblings, member.id, members, relationships]);
  const age = calculateAge(member.dateOfBirth, member.dateOfDeath);
  const isDeceased = !!member.dateOfDeath;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <MemberAvatar member={member} size="lg" />
            <h1 className="text-2xl font-bold mt-3">{member.name}</h1>
            {member.maidenName && (
              <p className="text-sm text-gray-500">née {member.maidenName}</p>
            )}
            <p className="text-gray-500">{getLifeSpan(member.dateOfBirth, member.dateOfDeath)}</p>
            {age !== null && (
              <Badge variant={isDeceased ? 'secondary' : 'default'} className="mt-1">
                {isDeceased ? `Lived ${age} years` : `Age ${age}`}
              </Badge>
            )}
            {isDeceased && (
              <Badge variant="outline" className="mt-1 text-gray-500">Deceased</Badge>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit2 className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAddChild(true)}>
              <Baby className="h-4 w-4 mr-1" /> Add Child
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAddSpouse(true)}>
              <Heart className="h-4 w-4 mr-1" /> Add Spouse
            </Button>
            <WhatsAppShareButton memberName={member.name} phoneNumber={member.phone} />
          </div>
        </CardContent>
      </Card>

      {/* Contact & details */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {member.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{member.location}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${member.phone}`} className="text-indigo-600 hover:underline">
                {member.phone}
              </a>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${member.email}`} className="text-indigo-600 hover:underline">
                {member.email}
              </a>
            </div>
          )}
          {member.dateOfBirth && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Born: {formatDate(member.dateOfBirth)}</span>
            </div>
          )}
          {member.dateOfDeath && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Died: {formatDate(member.dateOfDeath)}</span>
            </div>
          )}
          {member.bio && (
            <>
              <Separator />
              <p className="text-sm text-gray-600">{member.bio}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Family connections */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" /> Family Connections
          </h2>

          {spouses.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{spouses.length > 1 ? 'Spouses' : 'Spouse'}</p>
              <div className="space-y-1">
                {spouses.map((s) => (
                  <MemberLink key={s.id} member={s} />
                ))}
              </div>
            </div>
          )}

          {parents.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Parents</p>
              <div className="space-y-1">
                {parents.map((p) => (
                  <MemberLink key={p.id} member={p} />
                ))}
              </div>
            </div>
          )}

          {siblings.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Siblings</p>
              <div className="space-y-1">
                {siblings.map((s) => (
                  <MemberLink key={s.id} member={s} />
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Children</p>
              <div className="space-y-1">
                {children.map((c) => (
                  <MemberLink key={c.id} member={c} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <CommentSection memberId={member.id} />

      {/* Modals */}
      <EditMemberModal open={showEdit} onOpenChange={setShowEdit} member={member} />
      <AddMemberModal
        open={showAddChild}
        onOpenChange={setShowAddChild}
        relatedMemberId={member.id}
        defaultRelationType="parent"
      />
      <AddMemberModal
        open={showAddSpouse}
        onOpenChange={setShowAddSpouse}
        relatedMemberId={member.id}
        defaultRelationType="spouse"
      />
    </div>
  );
}

function MemberLink({ member }: { member: FamilyMember }) {
  return (
    <Link
      href={`/member/${member.id}`}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <MemberAvatar member={member} size="sm" />
      <span className="text-sm font-medium">{member.name}</span>
      {member.dateOfDeath && <Badge variant="outline" className="text-xs">Deceased</Badge>}
    </Link>
  );
}
