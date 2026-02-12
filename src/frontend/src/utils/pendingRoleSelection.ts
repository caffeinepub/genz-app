import { UserRole } from '../backend';

const PENDING_ROLE_KEY = 'genz_pending_role';

export function setPendingRole(role: UserRole): void {
  try {
    sessionStorage.setItem(PENDING_ROLE_KEY, role);
  } catch (error) {
    console.error('Failed to set pending role:', error);
  }
}

export function getPendingRole(): UserRole | null {
  try {
    const stored = sessionStorage.getItem(PENDING_ROLE_KEY);
    if (!stored) return null;
    
    // Validate that it's a valid UserRole
    if (stored === UserRole.client || stored === UserRole.provider || stored === UserRole.backOffice) {
      return stored as UserRole;
    }
  } catch (error) {
    console.error('Failed to get pending role:', error);
  }
  
  return null;
}

export function clearPendingRole(): void {
  try {
    sessionStorage.removeItem(PENDING_ROLE_KEY);
  } catch (error) {
    console.error('Failed to clear pending role:', error);
  }
}
