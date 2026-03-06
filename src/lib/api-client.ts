// API client for Cloudflare Pages Functions

import { FamilyMember, Relationship, Comment, Tree } from './types';

const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('gentree-edit-token');
}

export function setToken(token: string) {
  sessionStorage.setItem('gentree-edit-token', token);
}

export function clearToken() {
  sessionStorage.removeItem('gentree-edit-token');
}

export function hasToken(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

// --- Trees ---

export async function createTree(name: string, pin: string, creatorEmail?: string) {
  return request<{ id: string; slug: string; name: string; token: string }>(
    '/trees',
    { method: 'POST', body: JSON.stringify({ name, pin, creatorEmail }) }
  );
}

export async function getTree(slug: string) {
  return request<{ tree: Tree; members: FamilyMember[]; relationships: Relationship[] }>(
    `/trees/${slug}`
  );
}

export async function verifyPin(slug: string, pin: string) {
  return request<{ token: string }>(
    `/trees/${slug}/verify-pin`,
    { method: 'POST', body: JSON.stringify({ pin }) }
  );
}

// --- Members ---

export async function addMember(slug: string, member: Omit<FamilyMember, 'id'>) {
  return request<{ id: string; name: string; gender: string; generation: number }>(
    `/trees/${slug}/members`,
    { method: 'POST', body: JSON.stringify(member) }
  );
}

export async function updateMember(slug: string, id: string, updates: Partial<FamilyMember>) {
  return request<{ ok: boolean }>(
    `/trees/${slug}/members/${id}`,
    { method: 'PUT', body: JSON.stringify(updates) }
  );
}

export async function deleteMember(slug: string, id: string) {
  return request<{ ok: boolean }>(
    `/trees/${slug}/members/${id}`,
    { method: 'DELETE' }
  );
}

// --- Relationships ---

export async function addRelationship(slug: string, rel: Omit<Relationship, 'id'>) {
  return request<{ id: string; type: string; fromMemberId: string; toMemberId: string }>(
    `/trees/${slug}/relationships`,
    { method: 'POST', body: JSON.stringify(rel) }
  );
}

export async function removeRelationship(slug: string, id: string) {
  return request<{ ok: boolean }>(
    `/trees/${slug}/relationships/${id}`,
    { method: 'DELETE' }
  );
}

// --- Comments ---

export async function getComments(slug: string, memberId: string) {
  return request<{ comments: Comment[] }>(
    `/trees/${slug}/comments/${memberId}`
  );
}

export async function addComment(slug: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
  return request<Comment>(
    `/trees/${slug}/comments`,
    { method: 'POST', body: JSON.stringify(comment) }
  );
}

// --- Photos ---

export async function uploadPhoto(slug: string, memberId: string, file: File) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/trees/${slug}/photos/${memberId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Upload failed');
  }

  return res.json() as Promise<{ photoUrl: string }>;
}
