// components/MapComponent.jsx

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, GeoJSON } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
// import { buildQuery, fetchOverpass } from '../utils/services';
// import { toGeoJSON } from '../utils/geo';
