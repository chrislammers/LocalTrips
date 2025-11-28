// in my-map-tool, run > npm run dev


// src/MapComponent.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, GeoJSON } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';



// Handles map clicks and sends coordinates back to parent
function ClickHandler({ onMapClick }) {
  console.log("Map Click");
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}


function MapComponent() {
  // const lat = 51.5113;  //slough
  // const lng = -0.5913;
  // const defaultCoords = { lat, lng };

  const [routeData, setRouteData] = useState(null);
  const [totalLength, setTotalLength] = useState(null);
  const [operators, setOperators] = useState([]);
  const [visibleOperators, setVisibleOperators] = useState(new Set());

  const [clickPos, setClickPos] = useState({ lat: 51.5113, lng: -0.5913 });


  const toggleOperator = (op) => {
    setVisibleOperators(prev => {
      const next = new Set(prev); // copy
      if (next.has(op)) next.delete(op);
      else next.add(op);
      return next;
    });
  }
  // const [busRoutes, setBusRoutes] = useState([]);

  const handleMapClick = (latlng) => {
    setClickPos(latlng);
    console.log("Clicked:", latlng);
  };


  // Replace with user location or click
  // Current location: Oshawa
  // const lat = 43.9456;     // Oshawa
  // const lon = -78.8968;

  // const lat = 43.8040;     // Joyce House
  // const lon = -79.3783;

  // const lat = 51.5461;     // Ux
  // const lon = -0.4789; 

  const radius = 500;      // meters

  useEffect(() => {
    if (!clickPos) return;

    // const { lat, lng } = clickPos;
    // Clearing the data here will allow the newest possible route data to be displayed
    setRouteData(null);

    console.log("clickPos:", clickPos);
    

    // // This Query is stricter. 
    const query = `
      [out:json][timeout:25];
      (
        node["highway"="bus_stop"](around:${radius},${clickPos.lat},${clickPos.lng});
      )->.stops;
      relation["route"="bus"](bn.stops);
      out geom;
    `;


    // const query = `
    //   [out:json][timeout:25];
    //   relation["route"="bus"](around:${radius},${clickPos.lat},${clickPos.lng});
    //   out geom;
    // `;

    console.log("Query:", query);

    const fetchRoutes = async () => {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const data = await response.json();
      console.log("Queried Data: ", data);
      const features = data.elements
        .filter(el => el.type === 'relation')
        .flatMap(rel =>
          rel.members
            .filter(m => m.type === 'way' && m.geometry)
            .map(m => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: m.geometry
                  .filter(g => g.lat != null && g.lon != null) // drop bad points (nulls)
                  .map(g => [g.lon, g.lat]),
              },
              properties: {
                route: rel.tags?.name || 'unnamed',
                operator: rel.tags?.operator || rel.tags?.network || 'unknown',
                relation_id: rel.id,
              },
            }))
        );
      setRouteData({
        type: 'FeatureCollection',
        features,
      });
      const operators = [...new Set(features.map(f => f.properties.operator))];
      setOperators(operators);

      console.log("Operators", operators);
      
      console.log("Features", features);

      const totalKm = features.reduce((sum, f) => sum + turf.length(f), 0);
      setTotalLength(totalKm.toFixed(2));
    };
    fetchRoutes();
    console.log("Routes:", routeData);
  }, [clickPos]);

  return (
    <div>
  
      <h2>Bus Routes within {radius}m of ({clickPos.lat}, {clickPos.lng})</h2>
      {totalLength && <p><strong>Total route length:</strong> {totalLength} km</p>}
      <MapContainer center={[clickPos.lat, clickPos.lng]} zoom={14} style={{ height: '500px', width: '200vh' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={handleMapClick} />

        {clickPos && (
        <>
          <Marker
            position={clickPos}
            icon={L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>
              Search center:<br />
              Lat: {clickPos.lat.toFixed(5)}<br />
              Lon: {clickPos.lng.toFixed(5)}
            </Popup>
          </Marker>

          <Circle
            center={clickPos}
            radius={500} // meters
            pathOptions={{ color: 'blue', fillOpacity: 0.1 }}
          />
          {/* <GeoJSON data={routeData} style={{ color: 'green' }} /> */}
        </>
      )}
{/* THE NEXT LINE IS POTENTIALLY CAUSING ISSUES */}
        {/* {routeData && <GeoJSON data={routeData} style={{ color: 'blue' }} />} */}
        {routeData && (
          <GeoJSON
            key={`${clickPos.lat}-${clickPos.lng}`}
            data={{
              ...routeData,
              features: routeData.features.filter(f =>
                visibleOperators.size === 0 ||
                visibleOperators.has(f.properties.operator)
              )
            }}
            style={{ color: 'blue' }}
          />
        )}
      </MapContainer>
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow p-3">
          <h3>Operators</h3>
          {/* (operators || []) rather than just "operators" is for extra null safety */}
          {(operators || []).map(op => (
            <label key={op}>
              <input
                type="checkbox"
                checked={visibleOperators.has(op)}
                onChange={() => toggleOperator(op)}
              />
              {op}
            </label>
          ))}
        </div>
    </div>
  );
}

export default MapComponent;
