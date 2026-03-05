import { FamilyMember } from './types';
import { calculateAge, isUpcomingBirthday } from './date-utils';

export interface SearchFilters {
  query: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  location?: string;
  upcomingBirthdays?: boolean;
  isAlive?: boolean;
  generation?: number;
}

export function searchMembers(
  members: FamilyMember[],
  filters: SearchFilters
): FamilyMember[] {
  let results = [...members];

  // Text search (fuzzy-ish: case insensitive, partial match)
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    );
  }

  if (filters.gender) {
    results = results.filter((m) => m.gender === filters.gender);
  }

  if (filters.minAge !== undefined) {
    results = results.filter((m) => {
      const age = calculateAge(m.dateOfBirth, m.dateOfDeath);
      return age !== null && age >= filters.minAge!;
    });
  }

  if (filters.maxAge !== undefined) {
    results = results.filter((m) => {
      const age = calculateAge(m.dateOfBirth, m.dateOfDeath);
      return age !== null && age <= filters.maxAge!;
    });
  }

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    results = results.filter((m) => m.location?.toLowerCase().includes(loc));
  }

  if (filters.upcomingBirthdays) {
    results = results.filter(
      (m) => !m.dateOfDeath && isUpcomingBirthday(m.dateOfBirth, 30)
    );
  }

  if (filters.isAlive !== undefined) {
    results = results.filter((m) =>
      filters.isAlive ? !m.dateOfDeath : !!m.dateOfDeath
    );
  }

  if (filters.generation !== undefined) {
    results = results.filter((m) => m.generation === filters.generation);
  }

  return results;
}
