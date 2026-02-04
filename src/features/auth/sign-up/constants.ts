import { useMemo } from "react";

// Import country codes from library
import countryCodes from 'country-codes-list';

// Debug: Log what the library exports
// console.log('countryCodes:', countryCodes);
// console.log('countryCodes type:', typeof countryCodes);
// console.log('Is Array:', Array.isArray(countryCodes));
// console.log('Keys:', Object.keys(countryCodes).slice(0, 10));

// Define the country type
export type Country = {
    code: string;  // ISO 2-letter country code
    label: string; // Country name
    dial: string;   // Dial code
};

// Use all method which returns full country objects with all properties
const allCountriesFull = countryCodes.all() || [];

// Create a formatted countries array from the library
export const COUNTRIES: Country[] = Array.isArray(allCountriesFull) ? allCountriesFull
    .map((country: any) => ({
        code: country.countryCode,
        label: country.countryNameEn,
        dial: country.countryCallingCode
    }))
    // Filter out countries without label or dial code
    .filter((country: Country) => country.label && country.dial)
    // Sort alphabetically by label
    .sort((a: Country, b: Country) => (a.label || '').localeCompare((b.label || ''))) : [];

// Helper hook to get country by dial code
export const getCountryByDial = (dial: string): Country | undefined => {
    return COUNTRIES.find(country => country.dial === dial);
};

// Helper hook to get country by code
export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find(country => country.code === code);
};
