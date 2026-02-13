// Import country codes from library
import countryCodes from 'country-codes-list';

// Define the country type with flag
export type Country = {
    code: string;      // ISO 2-letter country code
    label: string;     // Country name
    dial: string;      // Dial code
    flagUrl: string;  // Flag image URL
};

// Flag CDN URL template (using flagcdn.com)
const getFlagUrl = (countryCode: string): string => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

// Use all method which returns full country objects with all properties
const allCountriesFull = countryCodes.all() || [];

// Create a formatted countries array from the library
export const COUNTRIES: Country[] = Array.isArray(allCountriesFull) ? allCountriesFull
    .map((country: any) => ({
        code: country.countryCode,
        label: country.countryNameEn,
        dial: country.countryCallingCode,
        flagUrl: getFlagUrl(country.countryCode)
    }))
    // Filter out countries without label or dial code
    .filter((country: Country) => country.label && country.dial)
    // Sort alphabetically by label
    .sort((a: Country, b: Country) => (a.label || '').localeCompare((b.label || ''))) : [];

// Helper to get country by dial code
export const getCountryByDial = (dial: string): Country | undefined => {
    return COUNTRIES.find(country => country.dial === dial);
};

// Helper to get country by code
export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find(country => country.code === code);
};
