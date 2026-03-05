'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <div className="flex gap-2">
        <Input
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="flex-1 bg-white"
          required
        />
        <Select value={type} onValueChange={(v) => setType(v as CommentType)}>
          <SelectTrigger className="w-32 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="birthday">Birthday</SelectItem>
            <SelectItem value="condolence">Condolence</SelectItem>
            <SelectItem value="memory">Memory</SelectItem>
          </SelectContent>
        </Select>
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
        <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
