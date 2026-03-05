'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect, NativeSelectItem } from '@/components/ui/native-select';
import { useFamilyStore } from '@/lib/family-store';
import { CommentType } from '@/lib/types';
import { Send } from 'lucide-react';

export function CommentForm({ memberId }: { memberId: string }) {
  const addComment = useFamilyStore((s) => s.addComment);
  const [authorName, setAuthorName] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState<CommentType>('general');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) return;

    addComment({
      id: nanoid(),
      memberId,
      authorName: authorName.trim(),
      text: text.trim(),
      type,
      createdAt: new Date().toISOString(),
    });

    setText('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-3 bg-gray-50">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="flex-1 bg-white h-10"
          required
        />
        <NativeSelect value={type} onValueChange={(v) => setType(v as CommentType)} className="w-full sm:w-32 bg-white h-10">
          <NativeSelectItem value="general">General</NativeSelectItem>
          <NativeSelectItem value="birthday">Birthday</NativeSelectItem>
          <NativeSelectItem value="condolence">Condolence</NativeSelectItem>
          <NativeSelectItem value="memory">Memory</NativeSelectItem>
        </NativeSelect>
      </div>
      <div className="flex gap-2">
        <Textarea
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="bg-white"
          required
        />
        <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 self-end min-h-[44px] min-w-[44px]">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
