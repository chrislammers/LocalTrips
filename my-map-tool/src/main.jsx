import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// function ClickHandler({ onMapClick }) {
//   useMapEvents({
//     click(e) {
//       onMapClick(e.latlng);
//     },
//   });

//   return null;
// }