import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons (tu código original)
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

  // --- EFECTO 1: CREAR EL MAPA (SE EJECUTA UNA SOLA VEZ) ---
  useEffect(() => {
    // Si el div del mapa existe y la instancia del mapa aún no ha sido creada...
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [40.4168, -3.7038],
        6,
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Guardamos la instancia del mapa en una ref para que persista entre renders
      mapInstanceRef.current = map;

      // Notificamos al componente padre que el mapa está listo
      onMapReady(map);
    }

    // La función de limpieza se ejecutará SOLO cuando el componente se desmonte del todo
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // El array de dependencias vacío [] es la clave.
    // Le dice a React: "Ejecuta este efecto SOLO UNA VEZ al montar y nunca más".
  }, [onMapReady]);

  // --- EFECTO 2: GESTIONAR EL LISTENER DE CLIC ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    // Si el mapa no existe, no hacemos nada
    if (!map) return;

    // Creamos una función manejadora para el clic que podamos añadir y quitar
    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    };

    // Añadimos el listener de clics al mapa
    map.on('click', handleClick);

    // La función de limpieza de ESTE efecto se ejecuta si onMapClick cambia o el componente se desmonta
    return () => {
      // Quitamos el listener para evitar duplicados y fugas de memoria
      map.off('click', handleClick);
    };
  }, [onMapClick]); // Este efecto se re-ejecuta solo si la prop onMapClick cambia

  return (
    <div
      ref={mapContainerRef} // Usamos la ref para que React nos dé el elemento div
      className="w-full h-full rounded-lg shadow-card-eco"
      style={{ minHeight: '500px' }}
    />
  );
};

export default MapContainer;