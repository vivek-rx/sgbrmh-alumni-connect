/**
 * Geocoding utilities for converting city/country to latitude/longitude
 * Uses OpenStreetMap's Nominatim API (free, no API key required)
 */

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Get coordinates from city and country using Nominatim API
 * @param city - City name
 * @param country - Country name
 * @returns Object with latitude and longitude, or null if not found
 */
export async function getCoordinates(
  city: string, 
  country: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Construct search query
    const query = `${city}, ${country}`;
    const encodedQuery = encodeURIComponent(query);
    
    // Use Nominatim API (free, open-source geocoding)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SGBRMH-Alumni-Connect' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data: GeocodingResult[] = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

/**
 * Validate latitude/longitude coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Get country code from country name
 * This is a simplified version - for production, use a proper library
 */
export const countryCodeMap: { [key: string]: string } = {
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'China': 'CN',
  'Japan': 'JP',
  'Singapore': 'SG',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  // Add more as needed
};

export function getCountryCode(countryName: string): string | null {
  return countryCodeMap[countryName] || null;
}
