'use client';

import { useState } from 'react';
import { useEditMode } from '@/lib/edit-mode';
import { PinModal } from './PinModal';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

interface EditModeToggleProps {
  slug: string;
}

export function EditModeToggle({ slug }: EditModeToggleProps) {
  const { isEditMode, exitEditMode } = useEditMode();
  const [showPin, setShowPin] = useState(false);

  if (isEditMode) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50"
        onClick={exitEditMode}
      >
        <Unlock className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Editing</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setShowPin(true)}
      >
        <Lock className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
      <PinModal open={showPin} onOpenChange={setShowPin} slug={slug} />
    </>
  );
}
