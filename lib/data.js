import AsyncStorage from '@react-native-async-storage/async-storage';

const PROPERTIES_KEY = '@realestate_properties';
const RENOVATIONS_KEY = '@realestate_renovations';
const ONBOARDED_KEY = '@realestate_onboarded';

// Default sample data
const defaultProperties = [
  {
    id: '1',
    name: 'Maple Street Duplex',
    address: '142 Maple Street, Austin, TX',
    type: 'Duplex',
    purchasePrice: 285000,
    currentValue: 340000,
    monthlyRent: 2800,
    monthlyExpenses: 1200,
    image: 'house1',
    yearPurchased: 2021,
    sqft: 2200,
    units: 2,
  },
  {
    id: '2',
    name: 'Oak Park Townhome',
    address: '78 Oak Park Dr, Austin, TX',
    type: 'Townhome',
    purchasePrice: 195000,
    currentValue: 245000,
    monthlyRent: 1800,
    monthlyExpenses: 850,
    image: 'house2',
    yearPurchased: 2022,
    sqft: 1500,
    units: 1,
  },
  {
    id: '3',
    name: 'River Bend Condo',
    address: '310 River Bend Blvd #4B, Austin, TX',
    type: 'Condo',
    purchasePrice: 165000,
    currentValue: 198000,
    monthlyRent: 1450,
    monthlyExpenses: 720,
    image: 'house3',
    yearPurchased: 2023,
    sqft: 950,
    units: 1,
  },
];

const defaultRenovations = [
  {
    id: '1',
    propertyId: '1',
    title: 'Kitchen Remodel - Unit A',
    description: 'Full kitchen renovation including new cabinets, countertops, and appliances',
    estimatedCost: 15000,
    actualCost: null,
    priority: 'high',
    status: 'in_progress',
    category: 'Kitchen',
    createdAt: '2024-01-15',
    dueDate: '2024-04-01',
    notes: 'Contractor scheduled for next month. Need to finalize countertop selection.',
  },
  {
    id: '2',
    propertyId: '1',
    title: 'Bathroom Tile Repair - Unit B',
    description: 'Replace cracked tiles and fix grout in master bathroom',
    estimatedCost: 2500,
    actualCost: null,
    priority: 'medium',
    status: 'pending',
    category: 'Bathroom',
    createdAt: '2024-02-01',
    dueDate: '2024-05-15',
    notes: '',
  },
  {
    id: '3',
    propertyId: '2',
    title: 'Roof Inspection & Repair',
    description: 'Annual roof inspection, patch any damaged shingles',
    estimatedCost: 3500,
    actualCost: 2800,
    priority: 'high',
    status: 'completed',
    category: 'Exterior',
    createdAt: '2023-11-01',
    dueDate: '2024-01-15',
    notes: 'Completed ahead of schedule. Minor repairs only.',
  },
  {
    id: '4',
    propertyId: '2',
    title: 'HVAC System Replacement',
    description: 'Replace aging HVAC unit with energy-efficient model',
    estimatedCost: 8000,
    actualCost: null,
    priority: 'high',
    status: 'pending',
    category: 'HVAC',
    createdAt: '2024-02-10',
    dueDate: '2024-06-01',
    notes: 'Get 3 quotes from local HVAC contractors.',
  },
  {
    id: '5',
    propertyId: '3',
    title: 'Interior Paint Refresh',
    description: 'Repaint all walls in neutral tones before next tenant',
    estimatedCost: 1800,
    actualCost: null,
    priority: 'low',
    status: 'pending',
    category: 'Interior',
    createdAt: '2024-02-15',
    dueDate: '2024-07-01',
    notes: 'Wait until current lease ends in June.',
  },
  {
    id: '6',
    propertyId: '3',
    title: 'Window Replacement',
    description: 'Replace single-pane windows with double-pane for energy efficiency',
    estimatedCost: 4200,
    actualCost: null,
    priority: 'medium',
    status: 'pending',
    category: 'Exterior',
    createdAt: '2024-01-20',
    dueDate: '2024-08-01',
    notes: 'Energy audit recommended this upgrade.',
  },
];

// Storage helpers
export async function getProperties() {
  try {
    const data = await AsyncStorage.getItem(PROPERTIES_KEY);
    if (data) return JSON.parse(data);
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(defaultProperties));
    return defaultProperties;
  } catch {
    return defaultProperties;
  }
}

export async function saveProperties(properties) {
  try {
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  } catch (e) {
    console.error('Failed to save properties', e);
  }
}

export async function getRenovations() {
  try {
    const data = await AsyncStorage.getItem(RENOVATIONS_KEY);
    if (data) return JSON.parse(data);
    await AsyncStorage.setItem(RENOVATIONS_KEY, JSON.stringify(defaultRenovations));
    return defaultRenovations;
  } catch {
    return defaultRenovations;
  }
}

export async function saveRenovations(renovations) {
  try {
    await AsyncStorage.setItem(RENOVATIONS_KEY, JSON.stringify(renovations));
  } catch (e) {
    console.error('Failed to save renovations', e);
  }
}

export async function getOnboarded() {
  try {
    const val = await AsyncStorage.getItem(ONBOARDED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setOnboarded() {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
  } catch (e) {
    console.error('Failed to set onboarded', e);
  }
}

export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem(ONBOARDED_KEY);
  } catch (e) {
    console.error('Failed to reset onboarding', e);
  }
}

export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([PROPERTIES_KEY, RENOVATIONS_KEY, ONBOARDED_KEY]);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
}

// Utility functions
export function formatCurrency(amount) {
  if (amount == null) return '$0';
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatCurrencyShort(amount) {
  if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(0) + 'K';
  return '$' + amount;
}

export function getPropertyColor(index) {
  const colors = ['#1B6B4A', '#D4A853', '#4A90D9', '#E54545', '#8B5CF6', '#F97316'];
  return colors[index % colors.length];
}

export function getPriorityColor(priority, colors) {
  switch (priority) {
    case 'high': return colors.danger;
    case 'medium': return colors.warning;
    case 'low': return colors.success;
    default: return colors.textSecondary;
  }
}

export function getStatusInfo(status, colors) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', color: colors.success, bg: colors.successLight };
    case 'in_progress':
      return { label: 'In Progress', color: colors.warning, bg: colors.warningLight };
    case 'pending':
      return { label: 'Pending', color: colors.textSecondary, bg: colors.surfaceSecondary };
    default:
      return { label: status, color: colors.textSecondary, bg: colors.surfaceSecondary };
  }
}

export const RENOVATION_CATEGORIES = [
  'Kitchen', 'Bathroom', 'Exterior', 'Interior', 'HVAC',
  'Plumbing', 'Electrical', 'Flooring', 'Landscaping', 'Other'
];

export const PROPERTY_TYPES = ['Single Family', 'Duplex', 'Triplex', 'Fourplex', 'Condo', 'Townhome', 'Apartment'];
