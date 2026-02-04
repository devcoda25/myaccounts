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

// Use customArray method which returns full country objects
const allCountriesArray = countryCodes.customArray();
console.log('customArray result:', allCountriesArray);

// Create a formatted countries array from the library
export const COUNTRIES: Country[] = Array.isArray(allCountriesArray) ? allCountriesArray
    .map((country: any) => ({
        code: country.countryCode,
        label: country.name,
        dial: country.tel
    }))
    // Filter and sort for relevant countries
    .filter((country: Country) => {
        // Priority countries for EVzone
        const priorityCodes = ['UG', 'KE', 'TZ', 'RW', 'NG', 'ZA', 'US', 'GB', 'CA', 'AE', 'IN', 'CN'];
        return priorityCodes.includes(country.code);
    })
    .sort((a: Country, b: Country) => a.label.localeCompare(b.label)) : [];

console.log('COUNTRIES:', COUNTRIES);

// Helper hook to get country by dial code
export const getCountryByDial = (dial: string): Country | undefined => {
    return COUNTRIES.find(country => country.dial === dial);
};

// Helper hook to get country by code
export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find(country => country.code === code);
};
