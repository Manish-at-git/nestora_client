export const getCurrencySymbol = (country?: string | null): string => {
  if (!country) return '₹'; // Default to Indian Rupee for Nestora
  
  const normalized = country.toLowerCase().trim();
  if (['india', 'in', 'ind'].includes(normalized)) {
    return '₹';
  }
  if (['united states', 'usa', 'us'].includes(normalized)) {
    return '$';
  }
  if (['united kingdom', 'uk', 'gb'].includes(normalized)) {
    return '£';
  }
  if (['united arab emirates', 'uae', 'ae'].includes(normalized)) {
    return 'AED ';
  }
  
  return '₹'; // Default
};

export const COUNTRIES = [
  { name: 'India', flag: '🇮🇳' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'United Arab Emirates', flag: '🇦🇪' }
];
