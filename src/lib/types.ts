export type Gender = 'male' | 'female' | 'other';

export type RelationshipType = 'parent' | 'spouse' | 'sibling';

export type CommentType = 'general' | 'birthday' | 'condolence' | 'memory';

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  dateOfBirth?: string; // ISO date string
  dateOfDeath?: string;
  photo?: string;
  photoUrl?: string;
  facebookUrl?: string;
  phone?: string;
  email?: string;
  location?: string;
  bio?: string;
  generation: number;
  maidenName?: string;
}

export interface Tree {
  id: string;
  slug: string;
  name: string;
  createdAt?: string;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  fromMemberId: string;
  toMemberId: string;
}

export interface Comment {
  id: string;
  memberId: string;
  authorName: string;
  text: string;
  type: CommentType;
  createdAt: string;
}

export interface FamilyStore {
  members: FamilyMember[];
  relationships: Relationship[];
  comments: Comment[];
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  addRelationship: (relationship: Relationship) => void;
  removeRelationship: (id: string) => void;
  addComment: (comment: Comment) => void;
  getChildren: (memberId: string) => FamilyMember[];
  getParents: (memberId: string) => FamilyMember[];
  getSpouse: (memberId: string) => FamilyMember | undefined;
  getSiblings: (memberId: string) => FamilyMember[];
  getMemberById: (id: string) => FamilyMember | undefined;
}
