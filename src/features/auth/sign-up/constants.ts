import { useMemo } from "react";

// Import country codes from library
import countryCodes from 'country-codes-list';

// Define the country type
export type Country = {
    code: string;  // ISO 2-letter country code
    label: string; // Country name
    dial: string;   // Dial code
};

// Get all countries from the library using customList
// @ts-ignore - Library types are incorrect, actual method supports arrays
const allCountriesObj = countryCodes.customList('countryCode', ['countryCode', 'name', 'tel']);

// Create a formatted countries array from the library
export const COUNTRIES: Country[] = Object.values(allCountriesObj as Record<string, unknown>)
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
    .sort((a: Country, b: Country) => a.label.localeCompare(b.label));

// Helper hook to get country by dial code
export const getCountryByDial = (dial: string): Country | undefined => {
    return COUNTRIES.find(country => country.dial === dial);
};

// Helper hook to get country by code
export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find(country => country.code === code);
};
