const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

interface GeocodeResult {
  lat: number;
  lng: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
}

const geocodeCache = new Map<string, GeocodeResult>();

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const cacheKey = query.toLowerCase().trim();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const url = `${NOMINATIM_ENDPOINT}?q=${encodeURIComponent(query + ', India')}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CoalGuard-AI-Frontend/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Geocoding failed for:', query, error);
    return null;
  }
}
