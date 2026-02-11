/**
 * Utility functions for computing and formatting remaining engagement time
 */

export interface RemainingTime {
  hours: number;
  minutes: number;
  totalMinutes: number;
  hasExpired: boolean;
}

/**
 * Calculate remaining time from an engagement end time (bigint nanoseconds)
 */
export function calculateRemainingTime(engagementEndTime?: bigint): RemainingTime | null {
  if (!engagementEndTime) {
    return null;
  }

  const now = Date.now() * 1_000_000; // Convert to nanoseconds
  const endTime = Number(engagementEndTime);
  const remainingNanos = endTime - now;

  if (remainingNanos <= 0) {
    return {
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      hasExpired: true,
    };
  }

  const remainingMillis = remainingNanos / 1_000_000;
  const totalMinutes = Math.floor(remainingMillis / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hours,
    minutes,
    totalMinutes,
    hasExpired: false,
  };
}

/**
 * Format remaining time for display (e.g., "Available in 2h 15m")
 */
export function formatRemainingTime(engagementEndTime?: bigint): string | null {
  const remaining = calculateRemainingTime(engagementEndTime);

  if (!remaining) {
    return null;
  }

  if (remaining.hasExpired) {
    return 'Available now';
  }

  if (remaining.hours > 0) {
    if (remaining.minutes > 0) {
      return `Available in ${remaining.hours}h ${remaining.minutes}m`;
    }
    return `Available in ${remaining.hours}h`;
  }

  if (remaining.minutes > 0) {
    return `Available in ${remaining.minutes}m`;
  }

  return 'Available in less than 1m';
}

/**
 * Check if engagement has expired
 */
export function hasEngagementExpired(engagementEndTime?: bigint): boolean {
  if (!engagementEndTime) {
    return true;
  }

  const now = Date.now() * 1_000_000; // Convert to nanoseconds
  const endTime = Number(engagementEndTime);
  return now >= endTime;
}
