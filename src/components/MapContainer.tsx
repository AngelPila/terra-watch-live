import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🔧 Fix para los íconos por defecto de Leaflet (evita errores al cargar los marcadores)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapContainerProps {
  onMapReady: (map: L.Map) => void;
  onMapClick?: (coords: L.LatLng) => void;
}

const MapContainer = ({ onMapReady, onMapClick }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // --- EFECTO 1: CREAR EL MAPA ---
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // 🌍 Crear el mapa con límites globales (sin repeticiones infinitas)
      const map = L.map(mapContainerRef.current, {
        center: [0, 0],
        zoom: 2,
        worldCopyJump: false, // evita saltos entre copias del mapa
        maxBounds: [
          [-90, -180], // esquina suroeste del mundo
          [90, 180],   // esquina noreste del mundo
        ],
        maxBoundsViscosity: 1.0, // no deja salir del área
      });

      // 🌐 Capa base de OpenStreetMap sin repetición
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        noWrap: true, // 🚫 evita repeticiones horizontales
      }).addTo(map);

      mapInstanceRef.current = map;
      onMapReady(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapReady]);

  // --- EFECTO 2: MANEJAR CLICS ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onMapClick) onMapClick(e.latlng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClick]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-lg shadow-card-eco"
      style={{ minHeight: '500px' }}
    />
  );
};

export default MapContainer;
