// Zustand store backed by API — replaces family-store.ts for /tree/[slug] pages

import { create } from 'zustand';
import { FamilyMember, Relationship, Comment, Tree } from './types';
import * as api from './api-client';

interface ApiStore {
  // State
  tree: Tree | null;
  slug: string;
  members: FamilyMember[];
  relationships: Relationship[];
  comments: Comment[];
  loading: boolean;
  error: string | null;

  // Tree actions
  loadTree: (slug: string) => Promise<void>;
  createTree: (name: string, pin: string, creatorEmail?: string) => Promise<string>;

  // Member actions
  addMember: (member: Omit<FamilyMember, 'id'>) => Promise<FamilyMember>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  // Relationship actions
  addRelationship: (rel: Omit<Relationship, 'id'>) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;

  // Comment actions
  loadComments: (memberId: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;

  // Derived data helpers
  getChildren: (memberId: string) => FamilyMember[];
  getParents: (memberId: string) => FamilyMember[];
  getSpouses: (memberId: string) => FamilyMember[];
  getSiblings: (memberId: string) => FamilyMember[];
  getMemberById: (id: string) => FamilyMember | undefined;
}

export const useApiStore = create<ApiStore>()((set, get) => ({
  tree: null,
  slug: '',
  members: [],
  relationships: [],
  comments: [],
  loading: false,
  error: null,

  loadTree: async (slug: string) => {
    set({ loading: true, error: null, slug });
    try {
      const data = await api.getTree(slug);
      set({
        tree: data.tree,
        members: data.members,
        relationships: data.relationships,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  createTree: async (name: string, pin: string, creatorEmail?: string) => {
    const result = await api.createTree(name, pin, creatorEmail);
    api.setToken(result.token);
    set({ tree: { id: result.id, slug: result.slug, name: result.name }, slug: result.slug });
    return result.slug;
  },

  addMember: async (member) => {
    const { slug } = get();
    const result = await api.addMember(slug, member);
    const newMember: FamilyMember = { ...member, id: result.id };
    set((s) => ({ members: [...s.members, newMember] }));
    return newMember;
  },

  updateMember: async (id, updates) => {
    const { slug } = get();
    await api.updateMember(slug, id, updates);
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  deleteMember: async (id) => {
    const { slug } = get();
    await api.deleteMember(slug, id);
    set((s) => ({
      members: s.members.filter((m) => m.id !== id),
      relationships: s.relationships.filter(
        (r) => r.fromMemberId !== id && r.toMemberId !== id
      ),
      comments: s.comments.filter((c) => c.memberId !== id),
    }));
  },

  addRelationship: async (rel) => {
    const { slug } = get();
    const result = await api.addRelationship(slug, rel);
    const newRel: Relationship = { id: result.id, type: rel.type as Relationship['type'], fromMemberId: rel.fromMemberId, toMemberId: rel.toMemberId };
    set((s) => ({ relationships: [...s.relationships, newRel] }));
  },

  removeRelationship: async (id) => {
    const { slug } = get();
    await api.removeRelationship(slug, id);
    set((s) => ({ relationships: s.relationships.filter((r) => r.id !== id) }));
  },

  loadComments: async (memberId) => {
    const { slug } = get();
    const result = await api.getComments(slug, memberId);
    set((s) => {
      // Replace comments for this member, keep others
      const otherComments = s.comments.filter((c) => c.memberId !== memberId);
      return { comments: [...otherComments, ...result.comments] };
    });
  },

  addComment: async (comment) => {
    const { slug } = get();
    const result = await api.addComment(slug, comment);
    set((s) => ({ comments: [...s.comments, result] }));
  },

  // Derived data helpers (same logic as family-store)
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
}));
