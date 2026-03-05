import { mockMembers } from '@/lib/mock-data';
import MemberPageClient from './MemberPageClient';

export function generateStaticParams() {
  return mockMembers.map((member) => ({
    id: member.id,
  }));
}

export default function MemberPage() {
  return <MemberPageClient />;
}
