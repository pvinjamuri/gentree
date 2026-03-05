'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal';
import { NativeSelect, NativeSelectItem } from '@/components/ui/native-select';
import { Download, Loader2 } from 'lucide-react';
import { generatePdf, PaperSize } from '@/lib/pdf-generator';
import { WhatsAppShareButton } from '@/components/share/WhatsAppShareButton';

interface PdfExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  familyName?: string;
}

export function PdfExportButton({ targetRef, familyName = 'Sharma' }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>('a3');
  const [showUpsell, setShowUpsell] = useState(false);

  async function handleExport() {
    if (!targetRef.current) return;
    setLoading(true);
    try {
      await generatePdf(targetRef.current, paperSize, familyName);
      setShowUpsell(true);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <NativeSelect value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)} className="w-28">
          <NativeSelectItem value="a4">A4</NativeSelectItem>
          <NativeSelectItem value="a3">A3</NativeSelectItem>
          <NativeSelectItem value="letter">Letter</NativeSelectItem>
          <NativeSelectItem value="poster">Poster (24x36)</NativeSelectItem>
        </NativeSelect>

        <Button onClick={handleExport} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Family Tree
        </Button>
      </div>

      <Modal open={showUpsell} onOpenChange={setShowUpsell} className="max-w-sm text-center">
        <ModalHeader>Family Tree Downloaded!</ModalHeader>
        <ModalContent className="space-y-4">
          <p className="text-gray-600 text-sm">Share your family tree with relatives to help it grow!</p>
          <div className="flex justify-center">
            <WhatsAppShareButton size="lg" />
          </div>
          <p className="text-xs text-gray-400">Invite family members to add themselves to the tree</p>
        </ModalContent>
      </Modal>
    </>
  );
}
