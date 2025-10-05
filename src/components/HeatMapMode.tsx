import { useEffect } from 'react';
import L from 'leaflet';

// --- CAMBIO AQUÍ ---
// Las propiedades que este componente necesita ahora
interface HeatMapModeProps {
  map: L.Map | null; // Lo mantenemos por si lo necesitas después
  selectedCoords: L.LatLng | null;
}

const HeatMapMode = ({ map, selectedCoords }: HeatMapModeProps) => {
  
  // Este 'useEffect' se ejecutará CADA VEZ que 'selectedCoords' cambie
  useEffect(() => {
    // Si no hay coordenadas (porque aún no se ha hecho clic), no hacemos nada
    if (!selectedCoords) {
      return;
    }

    // Creamos una función asíncrona para llamar a la API
    const fetchData = async () => {
      console.log(
        `➡️ Preparando para llamar a la API con Lat: ${selectedCoords.lat}, Lon: ${selectedCoords.lng}`,
      );

      try {
        const apiUrl = `http://127.0.0.1:8000/api/pollution/?lat=${selectedCoords.lat}&lon=${selectedCoords.lng}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        // --- OBJETIVO CUMPLIDO ---
        // Aquí recibimos los datos y solo los mostramos en la consola
        console.log('✅ ¡Datos recibidos de la API de Django!', data);
        
      } catch (error) {
        console.error('❌ Error al llamar a la API:', error);
      }
    };

    // Ejecutamos la función
    fetchData();
  }, [selectedCoords]); // La dependencia es 'selectedCoords'

  // Por ahora, este componente no renderiza nada visualmente.
  // Podrías devolver un simple div o un mensaje si quisieras.
  return null;
};

export default HeatMapMode;