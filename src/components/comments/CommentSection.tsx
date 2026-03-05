'use client';

import { useMemo } from 'react';
import { useFamilyStore } from '@/lib/family-store';
import { CommentForm } from './CommentForm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentType } from '@/lib/types';

const typeColors: Record<CommentType, string> = {
  general: 'bg-gray-100 text-gray-700',
  birthday: 'bg-yellow-100 text-yellow-700',
  condolence: 'bg-blue-100 text-blue-700',
  memory: 'bg-green-100 text-green-700',
};

const typeLabels: Record<CommentType, string> = {
  general: 'General',
  birthday: 'Birthday',
  condolence: 'Condolence',
  memory: 'Memory',
};

export function CommentSection({ memberId }: { memberId: string }) {
  const allComments = useFamilyStore((s) => s.comments);
  const comments = useMemo(
    () => allComments.filter((c) => c.memberId === memberId),
    [allComments, memberId]
  );

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages & Memories ({comments.length})
        </h2>

        <CommentForm memberId={memberId} />

        <div className="space-y-3">
          {comments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{comment.authorName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={typeColors[comment.type]}>
                      {typeLabels[comment.type]}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{comment.text}</p>
              </div>
            ))}

          {comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No messages yet. Be the first to leave one!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
