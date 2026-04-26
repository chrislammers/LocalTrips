// services/overpass.js



export const buildQuery = (lat, lng, radius) => `
[out:json][timeout:25];
(
  node["highway"="bus_stop"](around:${radius},${lat},${lng});
)->.stops;
relation["route"="bus"](bn.stops);
out geom;
`;

export const fetchOverpass = async (query) => {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  return res.json();
};