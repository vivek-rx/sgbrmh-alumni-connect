# Location System for Alumni Globe Mapping

## Overview
The alumni platform now includes a sophisticated location system that captures precise geographic coordinates for plotting alumni locations on an interactive globe/map.

## Features

### 1. **Smart Location Selection**
- **Country Selector**: Dropdown with all countries
- **State/Province Selector**: Optional, helps filter cities
- **City Selector**: Filtered by country and state selection
- Uses `react-country-state-city` library for standardized location data

### 2. **Automatic Geocoding**
- Automatically fetches latitude/longitude coordinates when city + country are selected
- Uses **OpenStreetMap Nominatim API** (free, no API key required)
- Coordinates are saved to database for map plotting

### 3. **Database Schema**
```sql
-- New columns added to alumni table:
latitude DECIMAL(10, 8)     -- Geographic latitude (-90 to 90)
longitude DECIMAL(11, 8)    -- Geographic longitude (-180 to 180)
country_code VARCHAR(2)     -- ISO country code (e.g., 'IN', 'US')
current_city TEXT           -- City name
current_country TEXT        -- Country name
```

## Setup Instructions

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor, run:
\i database/add-location-coordinates.sql
```

### Step 2: Update TypeScript Types
Add to `src/types/database.types.ts`:
```typescript
export interface Alumni {
  // ... existing fields
  latitude: number | null;
  longitude: number | null;
  country_code: string | null;
  current_city: string | null;
  current_country: string | null;
}
```

### Step 3: Test Location Selection
1. Go to Profile page
2. Click "Edit Profile"
3. Select Country → State (optional) → City
4. Check browser console for "Coordinates fetched: {lat, lon}"
5. Save profile

## Using Coordinates for Globe Visualization

### Recommended Libraries

#### 1. **React Globe.gl** (3D Interactive Globe)
```bash
npm install react-globe.gl
```

```tsx
import Globe from 'react-globe.gl';

function AlumniGlobe({ alumni }) {
  const data = alumni
    .filter(a => a.latitude && a.longitude)
    .map(a => ({
      lat: a.latitude,
      lng: a.longitude,
      name: a.name,
      city: a.current_city,
      country: a.current_country
    }));

  return (
    <Globe
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      pointsData={data}
      pointLat="lat"
      pointLng="lng"
      pointLabel={d => `${d.name} - ${d.city}, ${d.country}`}
      pointAltitude={0.01}
      pointColor={() => 'rgba(255, 100, 50, 0.75)'}
      pointRadius={0.25}
    />
  );
}
```

#### 2. **Leaflet** (2D Interactive Map)
```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function AlumniMap({ alumni }) {
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {alumni.map(a => a.latitude && a.longitude && (
        <Marker key={a.id} position={[a.latitude, a.longitude]}>
          <Popup>
            <strong>{a.name}</strong><br/>
            {a.current_city}, {a.current_country}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

#### 3. **Deck.gl** (High-Performance Visualization)
```bash
npm install deck.gl react-map-gl
```

### Fetching Alumni with Coordinates
```typescript
// In your component or page
const { data: alumni } = await supabase
  .from('alumni')
  .select('id, name, current_city, current_country, latitude, longitude')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null);
```

## Data Quality

### Geocoding Accuracy
- ✅ Cities: ~100 meters accuracy
- ✅ Countries: Center of country
- ⚠️ Requires valid city + country combination

### Handling Missing Coordinates
```typescript
// Check if coordinates exist
if (alumni.latitude && alumni.longitude) {
  // Plot on map
} else {
  // Show in list view instead
}
```

## Rate Limiting (Nominatim API)
- **Limit**: 1 request per second
- **Usage Policy**: https://operations.osmfoundation.org/policies/nominatim/
- **Best Practice**: Cache coordinates in database (already implemented)

## Alternative Geocoding Services

### If you need better accuracy or higher rate limits:

1. **Google Geocoding API** (paid)
   - Most accurate
   - $5 per 1000 requests
   - https://developers.google.com/maps/documentation/geocoding

2. **Mapbox Geocoding API** (freemium)
   - 100,000 free requests/month
   - https://docs.mapbox.com/api/search/geocoding/

3. **LocationIQ** (freemium)
   - 5,000 free requests/day
   - https://locationiq.com/

## Troubleshooting

### Coordinates not fetching?
1. Check browser console for errors
2. Verify Nominatim API is accessible (firewall/VPN issues)
3. Ensure city + country names are valid

### Wrong coordinates?
- City names with special characters may cause issues
- Try more specific city name (e.g., "Mumbai, Maharashtra" instead of just "Mumbai")

### Database errors?
- Run migration script first: `add-location-coordinates.sql`
- Update TypeScript types to include new fields

## Future Enhancements
- [ ] Heatmap showing concentration of alumni
- [ ] Filter by country/city
- [ ] Connection lines between alumni
- [ ] Batch geocoding for existing alumni
- [ ] Admin dashboard with geographic analytics
