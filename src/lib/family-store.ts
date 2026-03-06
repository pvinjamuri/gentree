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

      getSpouses: (memberId: string) => {
        const { members, relationships } = get();
        const spouseIdSet = new Set<string>();
        // Explicit spouse relationships
        relationships
          .filter(
            (r) =>
              r.type === 'spouse' &&
              (r.fromMemberId === memberId || r.toMemberId === memberId)
          )
          .forEach((r) =>
            spouseIdSet.add(r.fromMemberId === memberId ? r.toMemberId : r.fromMemberId)
          );
        // Infer co-parents as spouses
        const myChildIds = relationships
          .filter((r) => r.type === 'parent' && r.fromMemberId === memberId)
          .map((r) => r.toMemberId);
        for (const childId of myChildIds) {
          relationships
            .filter((r) => r.type === 'parent' && r.toMemberId === childId && r.fromMemberId !== memberId)
            .forEach((r) => spouseIdSet.add(r.fromMemberId));
        }
        return members.filter((m) => spouseIdSet.has(m.id));
      },

      getSiblings: (memberId: string) => {
        const { members, relationships } = get();
        // Derive siblings from shared parents (anyone with a common parent)
        const parentIds = relationships
          .filter((r) => r.type === 'parent' && r.toMemberId === memberId)
          .map((r) => r.fromMemberId);
        if (parentIds.length === 0) return [];
        const siblingIds = new Set(
          relationships
            .filter(
              (r) =>
                r.type === 'parent' &&
                parentIds.includes(r.fromMemberId) &&
                r.toMemberId !== memberId
            )
            .map((r) => r.toMemberId)
        );
        return members.filter((m) => siblingIds.has(m.id));
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
