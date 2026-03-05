'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyMember } from '@/lib/types';
import { useFamilyStore } from '@/lib/family-store';
import { Edit2, Baby, Heart, User, Users } from 'lucide-react';
import { AddMemberModal } from '@/components/members/AddMemberModal';
import { EditMemberModal } from '@/components/members/EditMemberModal';

interface NodeContextMenuProps {
  x: number;
  y: number;
  member: FamilyMember;
  onClose: () => void;
}

export function NodeContextMenu({ x, y, member, onClose }: NodeContextMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddSpouse, setShowAddSpouse] = useState(false);
  const spouse = useFamilyStore((s) => s.getSpouse(member.id));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position so menu doesn't overflow viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 100,
  };

  return (
    <>
      <div ref={menuRef} style={menuStyle}>
        <div className="bg-white rounded-lg shadow-xl border py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => {
              router.push(`/member/${member.id}`);
              onClose();
            }}
          >
            <User className="h-4 w-4 text-gray-500" />
            View Profile
          </button>

          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => {
              setShowEdit(true);
              onClose();
            }}
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
            Edit Member
          </button>

          <div className="h-px bg-gray-100 my-1" />

          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => {
              setShowAddChild(true);
              onClose();
            }}
          >
            <Baby className="h-4 w-4 text-gray-500" />
            Add Child
          </button>

          {!spouse && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
              onClick={() => {
                setShowAddSpouse(true);
                onClose();
              }}
            >
              <Heart className="h-4 w-4 text-gray-500" />
              Add Spouse
            </button>
          )}

          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => {
              onClose();
              // Scroll to sibling add - use the add modal with sibling type
            }}
          >
            <Users className="h-4 w-4 text-gray-500" />
            Add Sibling
          </button>
        </div>
      </div>

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
    </>
  );
}
