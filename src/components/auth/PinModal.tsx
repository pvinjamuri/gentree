'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2 } from 'lucide-react';
import { useEditMode } from '@/lib/edit-mode';

interface PinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

export function PinModal({ open, onOpenChange, slug }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { enterEditMode } = useEditMode();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError('');
    const success = await enterEditMode(slug, pin);
    setLoading(false);

    if (success) {
      setPin('');
      onOpenChange(false);
    } else {
      setError('Invalid PIN. Please try again.');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} className="max-w-xs">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-600" />
          Enter Admin PIN
        </div>
      </ModalHeader>
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">
            Enter the admin PIN to edit this family tree.
          </p>
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest h-12"
            autoFocus
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" disabled={loading || pin.length < 4} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}
