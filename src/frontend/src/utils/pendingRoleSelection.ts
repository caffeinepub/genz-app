import { UserRole } from '../backend';

const PENDING_ROLE_KEY = 'genz_pending_role';

export function setPendingRole(role: UserRole): void {
  sessionStorage.setItem(PENDING_ROLE_KEY, role);
}

export function getPendingRole(): UserRole | null {
  const stored = sessionStorage.getItem(PENDING_ROLE_KEY);
  if (!stored) return null;
  
  // Validate that it's a valid UserRole
  if (stored === UserRole.client || stored === UserRole.provider || stored === UserRole.backOffice) {
    return stored as UserRole;
  }
  
  return null;
}

export function clearPendingRole(): void {
  sessionStorage.removeItem(PENDING_ROLE_KEY);
}
