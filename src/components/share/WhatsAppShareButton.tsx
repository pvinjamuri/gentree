'use client';

import { Button } from '@/components/ui/button';
import { generateInviteMessage, generateShareMessage, shareViaWhatsApp } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';

interface WhatsAppShareButtonProps {
  memberName?: string;
  phoneNumber?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function WhatsAppShareButton({
  memberName,
  phoneNumber,
  variant = 'outline',
  size = 'sm',
}: WhatsAppShareButtonProps) {
  function handleShare() {
    const message = memberName
      ? generateInviteMessage(memberName)
      : generateShareMessage();
    shareViaWhatsApp(message, phoneNumber);
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
    >
      <MessageCircle className="h-4 w-4" />
      {phoneNumber ? 'Invite via WhatsApp' : 'Share on WhatsApp'}
    </Button>
  );
}
