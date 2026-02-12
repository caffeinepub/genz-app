/**
 * Utilities for Google Maps integration without requiring an API key.
 * Provides URL generation for embeds and external navigation.
 */

/**
 * Validates that coordinates are non-zero and valid
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return latitude !== 0 && longitude !== 0 && 
         !isNaN(latitude) && !isNaN(longitude) &&
         latitude >= -90 && latitude <= 90 &&
         longitude >= -180 && longitude <= 180;
}

/**
 * Generates a Google Maps embed URL for an iframe
 * Uses the public embed API (no key required)
 */
export function getGoogleMapsEmbedUrl(latitude: number, longitude: number): string {
  if (!isValidCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates provided');
  }
  
  // Public embed URL format
  return `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Generates a Google Maps URL for opening in a new tab
 * Prefers coordinates when valid, falls back to address search
 */
export function getGoogleMapsNavigationUrl(
  latitude: number,
  longitude: number,
  address?: string
): string {
  if (isValidCoordinates(latitude, longitude)) {
    // Use coordinate-based URL
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  } else if (address && address.trim().length > 0) {
    // Fallback to address search
    const encodedAddress = encodeURIComponent(address.trim());
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }
  
  throw new Error('No valid coordinates or address provided');
}
