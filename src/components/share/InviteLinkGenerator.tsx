'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Share2 } from 'lucide-react';
import { WhatsAppShareButton } from './WhatsAppShareButton';

export function InviteLinkGenerator() {
  const [copied, setCopied] = useState(false);
  const inviteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gentree.app';

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Invite Family Members
        </h3>
        <p className="text-sm text-gray-500">
          Share this link with family members so they can view the tree and add themselves.
        </p>

        <div className="flex gap-2">
          <Input value={inviteUrl} readOnly className="bg-gray-50" />
          <Button variant="outline" onClick={copyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <WhatsAppShareButton size="default" />
        </div>
      </CardContent>
    </Card>
  );
}
