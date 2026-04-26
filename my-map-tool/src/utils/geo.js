// utils/geo.js




export const toGeoJSON = (data) => ({
  type: 'FeatureCollection',
  features: data.elements
    .filter(el => el.type === 'relation')
    .flatMap(rel =>
      rel.members
        .filter(m => m.type === 'way' && m.geometry)
        .map(m => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: m.geometry
              .filter(g => g.lat != null && g.lon != null)
              .map(g => [g.lon, g.lat]),
          },
          properties: {
            route: rel.tags?.name || 'unnamed',
            operator: rel.tags?.operator || rel.tags?.network || 'unknown',
            relation_id: rel.id,
          },
        }))
    )
});