import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FamilyMember, Relationship, Comment, FamilyStore } from './types';
import { mockMembers, mockRelationships, mockComments } from './mock-data';

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      relationships: mockRelationships,
      comments: mockComments,

      addMember: (member: FamilyMember) =>
        set((state) => ({ members: [...state.members, member] })),

      updateMember: (id: string, updates: Partial<FamilyMember>) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMember: (id: string) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          relationships: state.relationships.filter(
            (r) => r.fromMemberId !== id && r.toMemberId !== id
          ),
          comments: state.comments.filter((c) => c.memberId !== id),
        })),

      addRelationship: (relationship: Relationship) =>
        set((state) => ({
          relationships: [...state.relationships, relationship],
        })),

      removeRelationship: (id: string) =>
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
        })),

      addComment: (comment: Comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),

      getChildren: (memberId: string) => {
        const { members, relationships } = get();
        const childIds = relationships
          .filter((r) => r.type === 'parent' && r.fromMemberId === memberId)
          .map((r) => r.toMemberId);
        return members.filter((m) => childIds.includes(m.id));
      },

      getParents: (memberId: string) => {
        const { members, relationships } = get();
        const parentIds = relationships
          .filter((r) => r.type === 'parent' && r.toMemberId === memberId)
          .map((r) => r.fromMemberId);
        return members.filter((m) => parentIds.includes(m.id));
      },

      getSpouse: (memberId: string) => {
        const { members, relationships } = get();
        const spouseRel = relationships.find(
          (r) =>
            r.type === 'spouse' &&
            (r.fromMemberId === memberId || r.toMemberId === memberId)
        );
        if (!spouseRel) return undefined;
        const spouseId =
          spouseRel.fromMemberId === memberId
            ? spouseRel.toMemberId
            : spouseRel.fromMemberId;
        return members.find((m) => m.id === spouseId);
      },

      getSiblings: (memberId: string) => {
        const { members, relationships } = get();
        const siblingIds = relationships
          .filter(
            (r) =>
              r.type === 'sibling' &&
              (r.fromMemberId === memberId || r.toMemberId === memberId)
          )
          .map((r) =>
            r.fromMemberId === memberId ? r.toMemberId : r.fromMemberId
          );
        return members.filter((m) => siblingIds.includes(m.id));
      },

      getMemberById: (id: string) => {
        return get().members.find((m) => m.id === id);
      },
    }),
    {
      name: 'gentree-family-storage',
      skipHydration: true,
    }
  )
);
