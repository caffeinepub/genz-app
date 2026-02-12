import { ClientProfile, ProviderProfileView } from '@/backend';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
}

function isValidText(text: string | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed !== 'UNKNOWN' && trimmed !== '0';
}

function isValidIdNumber(idNumber: string | undefined): boolean {
  if (!idNumber) return false;
  const trimmed = idNumber.trim();
  return trimmed.length > 0 && trimmed !== '0' && trimmed !== 'UNKNOWN';
}

function isValidPhoneNumber(phone: string | undefined): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  return trimmed.length > 0 && trimmed !== 'UNKNOWN';
}

function isValidLocation(location: { latitude: number; longitude: number; address: string } | undefined): boolean {
  if (!location) return false;
  return location.latitude !== 0 && location.longitude !== 0 && isValidText(location.address);
}

export function checkClientProfileCompletion(profile: ClientProfile | undefined): ProfileCompletionStatus {
  if (!profile) {
    return { isComplete: false, missingFields: ['Profile not found'] };
  }

  const missingFields: string[] = [];

  if (!isValidText(profile.surname)) {
    missingFields.push('Surname');
  }
  if (!isValidText(profile.middleName)) {
    missingFields.push('Middle Name');
  }
  if (!isValidText(profile.lastName)) {
    missingFields.push('Last Name');
  }
  if (!isValidText(profile.yearOfBirth)) {
    missingFields.push('Year of Birth');
  }
  if (!isValidIdNumber(profile.idNumber)) {
    missingFields.push('ID Number');
  }
  if (!isValidPhoneNumber(profile.mobileNumber)) {
    missingFields.push('Mobile Number');
  }
  if (!isValidPhoneNumber(profile.phoneNumber)) {
    missingFields.push('Phone Number');
  }
  if (!isValidLocation(profile.pinnedLocation)) {
    missingFields.push('Exact Location (address and coordinates)');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function checkProviderProfileCompletion(profile: ProviderProfileView | undefined): ProfileCompletionStatus {
  if (!profile) {
    return { isComplete: false, missingFields: ['Profile not found'] };
  }

  const missingFields: string[] = [];

  if (!isValidText(profile.surname)) {
    missingFields.push('Surname');
  }
  if (!isValidText(profile.middleName)) {
    missingFields.push('Middle Name');
  }
  if (!isValidText(profile.lastName)) {
    missingFields.push('Last Name');
  }
  if (!isValidText(profile.yearOfBirth)) {
    missingFields.push('Year of Birth');
  }
  if (!isValidIdNumber(profile.idNumber)) {
    missingFields.push('ID Number');
  }
  if (!isValidPhoneNumber(profile.phoneNumber)) {
    missingFields.push('Phone Number');
  }
  if (!isValidLocation(profile.location)) {
    missingFields.push('Exact Location (address and coordinates)');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}
