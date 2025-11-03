# Quick Start: Alumni Globe Visualization

## What You Have Now ✅

### 1. Location Data Collection
- ✅ Country/State/City dropdowns in Profile page
- ✅ Automatic latitude/longitude fetching via OpenStreetMap
- ✅ Data stored in database with coordinates

### 2. Database Schema
- ✅ `latitude` and `longitude` columns ready
- ✅ `country_code` for ISO standard country codes
- ✅ SQL migration script created

## Next Steps 🚀

### Step 1: Run Database Migration
```bash
# In Supabase Dashboard → SQL Editor → New Query
# Copy and paste content from: database/add-location-coordinates.sql
# Click "Run"
```

### Step 2: Update TypeScript Types
```typescript
// In src/types/database.types.ts, add to Alumni interface:
latitude: number | null;
longitude: number | null;
country_code: string | null;
```

### Step 3: Choose Your Visualization Library

#### Option A: 3D Globe (Recommended for "Wow" Factor)
```bash
npm install react-globe.gl three
```

Create `src/pages/AlumniGlobe.tsx`:
```tsx
import Globe from 'react-globe.gl';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AlumniGlobe() {
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    async function fetchAlumni() {
      const { data } = await supabase
        .from('alumni')
        .select('*')
        .not('latitude', 'is', null);
      
      setAlumni(data || []);
    }
    fetchAlumni();
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={alumni}
        pointLat="latitude"
        pointLng="longitude"
        pointLabel={d => `${d.name}<br/>${d.current_city}, ${d.current_country}`}
        pointColor={() => '#ff6432'}
        pointAltitude={0.02}
        pointRadius={0.3}
      />
    </div>
  );
}
```

#### Option B: 2D Map (Simpler, Faster)
```bash
npm install leaflet react-leaflet
```

Create `src/pages/AlumniMap.tsx`:
```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AlumniMap({ alumni }) {
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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

### Step 4: Add to Navigation
```tsx
// In src/App.tsx or routing file
import AlumniGlobe from './pages/AlumniGlobe';

// Add route
<Route path="/globe" element={<AlumniGlobe />} />
```

## Data Flow 📊

```
User selects location
       ↓
Country/City dropdowns
       ↓
Geocoding API (OpenStreetMap)
       ↓
Latitude/Longitude calculated
       ↓
Saved to Supabase database
       ↓
Fetched by Globe/Map component
       ↓
Plotted on visualization
```

## Example Queries

### Get all alumni with coordinates
```sql
SELECT name, current_city, current_country, latitude, longitude
FROM alumni
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

### Count alumni by country
```sql
SELECT current_country, COUNT(*) as count
FROM alumni
WHERE current_country IS NOT NULL
GROUP BY current_country
ORDER BY count DESC;
```

### Find alumni in specific region
```sql
-- Example: Alumni in India (approximate coordinates)
SELECT name, current_city
FROM alumni
WHERE latitude BETWEEN 8 AND 35
  AND longitude BETWEEN 68 AND 97;
```

## Pro Tips 💡

1. **Batch Update Existing Alumni**: If you have existing alumni without coordinates, create a script to geocode them
2. **Caching**: Coordinates are cached in database - no repeated API calls
3. **Privacy**: Consider adding a setting for alumni to hide their location
4. **Clustering**: For many markers, use marker clustering libraries
5. **Analytics**: Track which countries/cities have most alumni

## Troubleshooting

### "Coordinates not showing on map"
- ✅ Check if latitude/longitude columns exist in database
- ✅ Run SQL migration script
- ✅ Verify alumni have filled out location in their profile

### "Map not loading"
- ✅ Install required dependencies
- ✅ Import CSS files for map libraries
- ✅ Check browser console for errors

### "Wrong location plotted"
- ✅ Verify city name spelling
- ✅ Check coordinates in database (latitude should be -90 to 90)
- ✅ Re-save profile to fetch new coordinates

## Resources

- 📚 [React Globe.gl Examples](https://github.com/vasturiano/react-globe.gl)
- 📚 [Leaflet Documentation](https://leafletjs.com/)
- 📚 [OpenStreetMap Nominatim](https://nominatim.org/)
- 📚 [Three.js (for 3D)](https://threejs.org/)

## Need Help?

Refer to: `database/LOCATION_SYSTEM_README.md` for detailed documentation.
