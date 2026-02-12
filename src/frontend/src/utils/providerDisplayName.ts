import { ProviderProfileView } from '../backend';

/**
 * Derives a safe, non-empty display name from a ProviderProfileView.
 * Falls back to a combination of name parts or a default label if all fields are empty.
 */
export function getProviderDisplayName(provider: ProviderProfileView): string {
  // First, try the displayName from backend (already computed)
  if (provider.displayName && provider.displayName.trim().length > 0) {
    return provider.displayName.trim();
  }

  // Fallback: try the name field
  const trimmedName = provider.name?.trim() || '';
  if (trimmedName.length > 0 && trimmedName !== 'UNKNOWN' && trimmedName !== '0') {
    return trimmedName;
  }

  // Fallback: construct from surname and lastName
  const surname = provider.surname?.trim() || '';
  const lastName = provider.lastName?.trim() || '';
  
  if (surname.length > 0 && lastName.length > 0) {
    return `${surname} ${lastName}`;
  }
  
  if (surname.length > 0) {
    return surname;
  }
  
  if (lastName.length > 0) {
    return lastName;
  }

  // Final fallback: use a safe default
  return 'Service Provider';
}

/**
 * Gets safe initials from a provider name, with fallback for empty names.
 */
export function getProviderInitials(name: string): string {
  const trimmed = name?.trim() || '';
  
  if (trimmed.length === 0 || trimmed === 'UNKNOWN' || trimmed === '0') {
    return 'SP'; // Service Provider
  }

  const parts = trimmed.split(' ').filter(p => p.length > 0);
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  if (parts.length === 1 && parts[0].length === 1) {
    return parts[0][0].toUpperCase();
  }
  
  return 'SP';
}
