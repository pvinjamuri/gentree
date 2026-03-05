'use client';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Modal, ModalHeader, ModalContent } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect, NativeSelectItem } from '@/components/ui/native-select';
import { useFamilyStore } from '@/lib/family-store';
import { Gender, RelationshipType } from '@/lib/types';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedMemberId?: string;
  defaultRelationType?: RelationshipType;
}

export function AddMemberModal({
  open,
  onOpenChange,
  relatedMemberId,
  defaultRelationType,
}: AddMemberModalProps) {
  const { addMember, addRelationship, members } = useFamilyStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [relationType, setRelationType] = useState<RelationshipType>(
    defaultRelationType || 'parent'
  );
  const [relatedTo, setRelatedTo] = useState(relatedMemberId || '');

  const relatedMember = members.find((m) => m.id === relatedTo);

  function getGeneration(): number {
    if (!relatedMember) return 0;
    switch (relationType) {
      case 'parent':
        return relatedMember.generation + 1;
      case 'spouse':
      case 'sibling':
        return relatedMember.generation;
      default:
        return 0;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const memberId = nanoid();
    const generation = getGeneration();

    addMember({
      id: memberId,
      name: name.trim(),
      gender,
      dateOfBirth: dateOfBirth || undefined,
      dateOfDeath: dateOfDeath || undefined,
      phone: phone || undefined,
      email: email || undefined,
      location: location || undefined,
      bio: bio || undefined,
      generation,
    });

    if (relatedTo) {
      if (relationType === 'parent') {
        addRelationship({ id: nanoid(), type: 'parent', fromMemberId: relatedTo, toMemberId: memberId });
      } else {
        addRelationship({ id: nanoid(), type: relationType, fromMemberId: relatedTo, toMemberId: memberId });
      }
    }

    resetForm();
    onOpenChange(false);
  }

  function resetForm() {
    setName('');
    setGender('male');
    setDateOfBirth('');
    setDateOfDeath('');
    setPhone('');
    setEmail('');
    setLocation('');
    setBio('');
    setRelatedTo(relatedMemberId || '');
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader>Add Family Member</ModalHeader>
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          </div>

          <div>
            <Label>Gender</Label>
            <NativeSelect value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <NativeSelectItem value="male">Male</NativeSelectItem>
              <NativeSelectItem value="female">Female</NativeSelectItem>
              <NativeSelectItem value="other">Other</NativeSelectItem>
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dod">Date of Death</Label>
              <Input id="dod" type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-..." />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio..." rows={2} />
          </div>

          <div className="border-t pt-4">
            <Label>Relationship</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <NativeSelect value={relationType} onValueChange={(v) => setRelationType(v as RelationshipType)}>
                <NativeSelectItem value="parent">Child of</NativeSelectItem>
                <NativeSelectItem value="spouse">Spouse of</NativeSelectItem>
                <NativeSelectItem value="sibling">Sibling of</NativeSelectItem>
              </NativeSelect>

              <NativeSelect value={relatedTo} onValueChange={setRelatedTo} placeholder="Select member">
                {members.map((m) => (
                  <NativeSelectItem key={m.id} value={m.id}>{m.name}</NativeSelectItem>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Add Member</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
