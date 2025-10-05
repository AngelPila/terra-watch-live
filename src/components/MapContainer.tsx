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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  // guardamos el handler actual para poder eliminarlo luego
  const clickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);

  // --- EFECTO 1: CREAR EL MAPA (solo una vez) ---
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Crear el mapa centrado en [20, 0] con zoom 2
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: false,
      // Limites globales para evitar desplazamiento infinito
      maxBounds: [
        [-90, -180], // suroeste
        [90, 180],   // noreste
      ],
      maxBoundsViscosity: 1.0,
    });

    // Capa base (OpenStreetMap) sin repetición horizontal
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      noWrap: true,
    }).addTo(map);

    // Si onMapClick está presente al inicializar, la añadimos
    if (onMapClick) {
      const initialHandler = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
      };
      map.on('click', initialHandler);
      clickHandlerRef.current = initialHandler;
    }

    mapInstanceRef.current = map;
    onMapReady(map);

    // limpieza cuando el componente se desmonte
    return () => {
      try {
        if (clickHandlerRef.current) {
          map.off('click', clickHandlerRef.current);
          clickHandlerRef.current = null;
        }
        map.remove();
      } catch (err) {
        // noop
      } finally {
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // se ejecuta una sola vez al montar

  // --- EFECTO 2: Actualizar/eliminar el listener de clic cuando onMapClick cambie ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Si ya hay un handler registrado, lo quitamos primero
    if (clickHandlerRef.current) {
      map.off('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }

    // Si la nueva prop onMapClick existe, añadimos el nuevo handler
    if (onMapClick) {
      const handler = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
      };
      map.on('click', handler);
      clickHandlerRef.current = handler;
    }

    // cleanup cuando onMapClick cambie o el componente se desmonte
    return () => {
      if (clickHandlerRef.current) {
        map.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [onMapClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg shadow-card-eco"
      style={{ minHeight: '500px' }}
    />
  );
};

export default MapContainer;
