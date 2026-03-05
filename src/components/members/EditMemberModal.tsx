'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFamilyStore } from '@/lib/family-store';
import { FamilyMember, Gender } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: FamilyMember;
}

export function EditMemberModal({ open, onOpenChange, member }: EditMemberModalProps) {
  const { updateMember, deleteMember } = useFamilyStore();
  const [name, setName] = useState(member.name);
  const [gender, setGender] = useState<Gender>(member.gender);
  const [dateOfBirth, setDateOfBirth] = useState(member.dateOfBirth || '');
  const [dateOfDeath, setDateOfDeath] = useState(member.dateOfDeath || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [email, setEmail] = useState(member.email || '');
  const [location, setLocation] = useState(member.location || '');
  const [bio, setBio] = useState(member.bio || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setName(member.name);
    setGender(member.gender);
    setDateOfBirth(member.dateOfBirth || '');
    setDateOfDeath(member.dateOfDeath || '');
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setLocation(member.location || '');
    setBio(member.bio || '');
  }, [member]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMember(member.id, {
      name: name.trim(),
      gender,
      dateOfBirth: dateOfBirth || undefined,
      dateOfDeath: dateOfDeath || undefined,
      phone: phone || undefined,
      email: email || undefined,
      location: location || undefined,
      bio: bio || undefined,
    });
    onOpenChange(false);
  }

  function handleDelete() {
    deleteMember(member.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {member.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Name *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input id="edit-dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-dod">Date of Death</Label>
              <Input id="edit-dod" type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-location">Location</Label>
            <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
          </div>

          <div className="flex justify-between pt-2">
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                  Confirm Delete
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Save
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
