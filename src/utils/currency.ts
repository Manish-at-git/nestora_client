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
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' }
];

/** Convert legacy plan country codes and uppercase names to Select option values. */
export const normalizeCountryName = (country?: string | null): string => {
  const normalized = country?.trim().toLowerCase();
  if (!normalized) return '';
  const aliases: Record<string, string> = {
    ind: 'in',
    india: 'in',
    usa: 'us',
    'united states': 'us',
    uk: 'gb',
    'united kingdom': 'gb',
    canada: 'ca',
    australia: 'au',
    singapore: 'sg',
    uae: 'ae',
    'united arab emirates': 'ae',
  };
  const code = aliases[normalized] || normalized;
  return COUNTRIES.find((item) => item.code.toLowerCase() === code)?.name || '';
};
