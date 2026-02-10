import { BusinessType } from '../backend';

export interface Category {
  id: string;
  label: string;
  businessType: BusinessType;
  icon: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'cleaning',
    label: 'Cleaning',
    businessType: { __kind__: 'cleaning', cleaning: null },
    icon: '/assets/generated/category-cleaning.dim_256x256.png',
  },
  {
    id: 'gardening',
    label: 'Gardening',
    businessType: { __kind__: 'maintenance', maintenance: null },
    icon: '/assets/generated/category-gardening.dim_256x256.png',
  },
  {
    id: 'dog-grooming',
    label: 'Dog Grooming',
    businessType: { __kind__: 'wellness', wellness: null },
    icon: '/assets/generated/category-dog-grooming.dim_256x256.png',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    businessType: { __kind__: 'maintenance', maintenance: null },
    icon: '/assets/generated/category-plumbing.dim_256x256.png',
  },
  {
    id: 'chef',
    label: 'Chef / Cooking',
    businessType: { __kind__: 'catering', catering: null },
    icon: '/assets/generated/category-chef.dim_256x256.png',
  },
  {
    id: 'electrician',
    label: 'Electrician',
    businessType: { __kind__: 'maintenance', maintenance: null },
    icon: '/assets/generated/category-electrician.dim_256x256.png',
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getBusinessTypeLabel(businessType: BusinessType): string {
  if ('cleaning' in businessType) return 'Cleaning';
  if ('catering' in businessType) return 'Catering';
  if ('maintenance' in businessType) return 'Maintenance';
  if ('wellness' in businessType) return 'Wellness';
  if ('construction' in businessType) return 'Construction';
  if ('consulting' in businessType) return 'Consulting';
  if ('education' in businessType) return 'Education';
  if ('finance' in businessType) return 'Finance';
  if ('healthcare' in businessType) return 'Healthcare';
  if ('hospitality' in businessType) return 'Hospitality';
  if ('it' in businessType) return 'IT';
  if ('manufacturing' in businessType) return 'Manufacturing';
  if ('marketing' in businessType) return 'Marketing';
  if ('realEstate' in businessType) return 'Real Estate';
  if ('retail' in businessType) return 'Retail';
  if ('transportation' in businessType) return 'Transportation';
  if ('other' in businessType) return businessType.other;
  return 'Other';
}
