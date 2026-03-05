import { differenceInYears, format, parse, isValid, isBefore, addDays, startOfDay } from 'date-fns';

export function calculateAge(dateOfBirth?: string, dateOfDeath?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (!isValid(birth)) return null;
  const end = dateOfDeath ? new Date(dateOfDeath) : new Date();
  return differenceInYears(end, birth);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (!isValid(date)) return '';
  return format(date, 'dd MMM yyyy');
}

export function getLifeSpan(dateOfBirth?: string, dateOfDeath?: string): string {
  const birth = dateOfBirth ? format(new Date(dateOfBirth), 'yyyy') : '?';
  if (dateOfDeath) {
    const death = format(new Date(dateOfDeath), 'yyyy');
    return `${birth} – ${death}`;
  }
  return `b. ${birth}`;
}

export function isUpcomingBirthday(dateOfBirth?: string, withinDays = 30): boolean {
  if (!dateOfBirth) return false;
  const today = startOfDay(new Date());
  const birth = new Date(dateOfBirth);
  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

  if (isBefore(thisYearBirthday, today)) {
    thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
  }

  const cutoff = addDays(today, withinDays);
  return !isBefore(cutoff, thisYearBirthday);
}

export function getDaysUntilBirthday(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const today = startOfDay(new Date());
  const birth = new Date(dateOfBirth);
  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

  if (isBefore(thisYearBirthday, today)) {
    thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
  }

  return Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
