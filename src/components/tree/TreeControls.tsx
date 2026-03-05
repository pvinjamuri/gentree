'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddMemberModal } from '@/components/members/AddMemberModal';

export function TreeControls() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="absolute bottom-20 right-4 md:bottom-6 z-10">
        <Button
          onClick={() => setShowAddModal(true)}
          size="lg"
          className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 h-14 w-14"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddMemberModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}
