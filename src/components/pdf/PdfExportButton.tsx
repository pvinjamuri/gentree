'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, Loader2, Share2 } from 'lucide-react';
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
        <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a4">A4</SelectItem>
            <SelectItem value="a3">A3</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
            <SelectItem value="poster">Poster (24x36)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleExport}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download Family Tree
        </Button>
      </div>

      {/* Post-download upsell */}
      <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Family Tree Downloaded!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 text-sm">
              Share your family tree with relatives to help it grow!
            </p>
            <div className="flex justify-center">
              <WhatsAppShareButton size="lg" />
            </div>
            <p className="text-xs text-gray-400">
              Invite family members to add themselves to the tree
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
