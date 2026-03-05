export function generateShareMessage(familyName = 'Sharma'): string {
  return `🌳 Join our ${familyName} Family Tree on Gentree!\n\nI'm building our family tree and would love you to be part of it. Click below to see the tree and add yourself!\n\n👉 ${getAppUrl()}\n\nLet's preserve our family history together! 🙏`;
}

export function generateInviteMessage(inviterName: string, familyName = 'Sharma'): string {
  return `Hey! ${inviterName} has invited you to join the ${familyName} Family Tree on Gentree 🌳\n\nClick to see your family tree and add yourself:\n👉 ${getAppUrl()}\n\nIt only takes a minute! 🙏`;
}

export function getWhatsAppShareUrl(message: string, phoneNumber?: string): string {
  const encodedMessage = encodeURIComponent(message);
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
  return `https://wa.me/?text=${encodedMessage}`;
}

function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://gentree.app';
}

export function shareViaWhatsApp(message: string, phoneNumber?: string): void {
  const url = getWhatsAppShareUrl(message, phoneNumber);
  window.open(url, '_blank');
}
