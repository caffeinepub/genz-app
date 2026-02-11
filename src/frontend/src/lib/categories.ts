import { BusinessType } from '../backend';

export interface Category {
  id: string;
  label: string;
  businessType: BusinessType;
  icon: string;
}

export const CATEGORIES: Category[] = [
  // Technical Trades (Priority)
  {
    id: 'electrician',
    label: 'Electrician',
    businessType: { __kind__: 'skilledTrade', skilledTrade: null },
    icon: '/assets/generated/category-electrician.dim_256x256.png',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    businessType: { __kind__: 'skilledTrade', skilledTrade: null },
    icon: '/assets/generated/category-plumbing.dim_256x256.png',
  },
  {
    id: 'carpentry',
    label: 'Carpentry',
    businessType: { __kind__: 'skilledTrade', skilledTrade: null },
    icon: '/assets/generated/category-technical-trades.dim_256x256.png',
  },
  {
    id: 'welding',
    label: 'Welding & Metal Work',
    businessType: { __kind__: 'skilledTrade', skilledTrade: null },
    icon: '/assets/generated/category-technical-trades.dim_256x256.png',
  },
  {
    id: 'masonry',
    label: 'Masonry & Bricklaying',
    businessType: { __kind__: 'construction', construction: null },
    icon: '/assets/generated/category-construction.dim_256x256.png',
  },
  {
    id: 'tiling',
    label: 'Tiling & Flooring',
    businessType: { __kind__: 'construction', construction: null },
    icon: '/assets/generated/category-construction.dim_256x256.png',
  },
  {
    id: 'painting',
    label: 'Painting & Decoration',
    businessType: { __kind__: 'construction', construction: null },
    icon: '/assets/generated/category-construction.dim_256x256.png',
  },
  {
    id: 'hvac',
    label: 'HVAC & Refrigeration',
    businessType: { __kind__: 'maintenance', maintenance: null },
    icon: '/assets/generated/category-technical-trades.dim_256x256.png',
  },
  {
    id: 'solar-installation',
    label: 'Solar Installation',
    businessType: { __kind__: 'skilledTrade', skilledTrade: null },
    icon: '/assets/generated/category-electrician.dim_256x256.png',
  },
  
  // IT & Electronics Repair
  {
    id: 'phone-repair',
    label: 'Phone & Tablet Repair',
    businessType: { __kind__: 'repair', repair: null },
    icon: '/assets/generated/category-it-repair.dim_256x256.png',
  },
  {
    id: 'computer-repair',
    label: 'Computer Repair',
    businessType: { __kind__: 'it', it: null },
    icon: '/assets/generated/category-it-repair.dim_256x256.png',
  },
  {
    id: 'networking',
    label: 'Networking & CCTV',
    businessType: { __kind__: 'it', it: null },
    icon: '/assets/generated/category-it-repair.dim_256x256.png',
  },
  {
    id: 'appliance-repair',
    label: 'Appliance Repair',
    businessType: { __kind__: 'repair', repair: null },
    icon: '/assets/generated/category-technical-trades.dim_256x256.png',
  },
  
  // Auto & Transport
  {
    id: 'auto-mechanic',
    label: 'Auto Mechanic',
    businessType: { __kind__: 'repair', repair: null },
    icon: '/assets/generated/category-auto-repair.dim_256x256.png',
  },
  {
    id: 'motorbike-repair',
    label: 'Motorbike Repair',
    businessType: { __kind__: 'repair', repair: null },
    icon: '/assets/generated/category-auto-repair.dim_256x256.png',
  },
  {
    id: 'auto-electrician',
    label: 'Auto Electrician',
    businessType: { __kind__: 'repair', repair: null },
    icon: '/assets/generated/category-auto-repair.dim_256x256.png',
  },
  
  // Construction & Building
  {
    id: 'construction',
    label: 'General Construction',
    businessType: { __kind__: 'construction', construction: null },
    icon: '/assets/generated/category-construction.dim_256x256.png',
  },
  {
    id: 'roofing',
    label: 'Roofing',
    businessType: { __kind__: 'construction', construction: null },
    icon: '/assets/generated/category-construction.dim_256x256.png',
  },
  
  // Handyman & Maintenance
  {
    id: 'handyman',
    label: 'Handyman Services',
    businessType: { __kind__: 'handyman', handyman: null },
    icon: '/assets/generated/category-technical-trades.dim_256x256.png',
  },
  {
    id: 'gardening',
    label: 'Gardening & Landscaping',
    businessType: { __kind__: 'maintenance', maintenance: null },
    icon: '/assets/generated/category-gardening.dim_256x256.png',
  },
  
  // Domestic & Personal Services
  {
    id: 'cleaning',
    label: 'Cleaning Services',
    businessType: { __kind__: 'cleaning', cleaning: null },
    icon: '/assets/generated/category-cleaning.dim_256x256.png',
  },
  {
    id: 'domestic-work',
    label: 'Domestic Work',
    businessType: { __kind__: 'domesticwork', domesticwork: null },
    icon: '/assets/generated/category-cleaning.dim_256x256.png',
  },
  {
    id: 'chef',
    label: 'Chef / Cooking',
    businessType: { __kind__: 'catering', catering: null },
    icon: '/assets/generated/category-chef.dim_256x256.png',
  },
  {
    id: 'hair-beauty',
    label: 'Hair & Beauty',
    businessType: { __kind__: 'hairAndBeauty', hairAndBeauty: null },
    icon: '/assets/generated/category-cleaning.dim_256x256.png',
  },
  
  // Security & Transport
  {
    id: 'security',
    label: 'Security Services',
    businessType: { __kind__: 'security', security: null },
    icon: '/assets/generated/category-technical-trades.dim_256x256.png',
  },
  {
    id: 'driver',
    label: 'Driver Services',
    businessType: { __kind__: 'transportation', transportation: null },
    icon: '/assets/generated/category-auto-repair.dim_256x256.png',
  },
  
  // Education & Training
  {
    id: 'tutoring',
    label: 'Tutoring & Training',
    businessType: { __kind__: 'education', education: null },
    icon: '/assets/generated/category-cleaning.dim_256x256.png',
  },
  
  // Other Services
  {
    id: 'pet-services',
    label: 'Pet Services',
    businessType: { __kind__: 'petServices', petServices: null },
    icon: '/assets/generated/category-dog-grooming.dim_256x256.png',
  },
  {
    id: 'event-services',
    label: 'Event Services',
    businessType: { __kind__: 'events', events: null },
    icon: '/assets/generated/category-chef.dim_256x256.png',
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getBusinessTypeLabel(businessType: BusinessType): string {
  if ('cleaning' in businessType) return 'Cleaning';
  if ('catering' in businessType) return 'Catering';
  if ('construction' in businessType) return 'Construction';
  if ('consulting' in businessType) return 'Consulting';
  if ('domesticwork' in businessType) return 'Domestic Work';
  if ('education' in businessType) return 'Education';
  if ('entertainment' in businessType) return 'Entertainment';
  if ('events' in businessType) return 'Events';
  if ('finance' in businessType) return 'Finance';
  if ('generalTrade' in businessType) return 'General Trade';
  if ('handyman' in businessType) return 'Handyman';
  if ('hairAndBeauty' in businessType) return 'Hair & Beauty';
  if ('healthcare' in businessType) return 'Healthcare';
  if ('hospitality' in businessType) return 'Hospitality';
  if ('it' in businessType) return 'IT';
  if ('legal' in businessType) return 'Legal';
  if ('maintenance' in businessType) return 'Maintenance';
  if ('manufacturing' in businessType) return 'Manufacturing';
  if ('marketing' in businessType) return 'Marketing';
  if ('mediar' in businessType) return 'Media';
  if ('personalServices' in businessType) return 'Personal Services';
  if ('petServices' in businessType) return 'Pet Services';
  if ('professionalServices' in businessType) return 'Professional Services';
  if ('realEstate' in businessType) return 'Real Estate';
  if ('repair' in businessType) return 'Repair';
  if ('retail' in businessType) return 'Retail';
  if ('sales' in businessType) return 'Sales';
  if ('security' in businessType) return 'Security';
  if ('skilledTrade' in businessType) return 'Skilled Trade';
  if ('socialServices' in businessType) return 'Social Services';
  if ('transportation' in businessType) return 'Transportation';
  if ('unskilledLabor' in businessType) return 'Unskilled Labor';
  if ('wellness' in businessType) return 'Wellness';
  if ('other' in businessType) return businessType.other;
  return 'Other';
}
