import { useEffect } from 'react';
import L from 'leaflet';

interface HeatMapModeProps {
  map: L.Map | null;
  selectedCoords: L.LatLng | null;
}

const HeatMapMode = ({ map, selectedCoords }: HeatMapModeProps) => {
  // --- OBTENER LA CLAVE DE API DE FORMA SEGURA ---
  // Vite expone las variables de .env.local en este objeto especial
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

  useEffect(() => {
    if (!selectedCoords) {
      return;
    }

    // Verificar si la clave de API está disponible antes de hacer la llamada
    if (!apiKey) {
      console.error("❌ ERROR: La clave de API de OpenWeatherMap no está configurada.");
      console.error("   Crea un archivo .env.local en la raíz del proyecto con la línea: VITE_OPENWEATHERMAP_API_KEY='tu_clave'");
      // Podríamos mostrar este error en la UI también
      return;
    }

    const fetchData = async () => {
      console.log(
        `➡️ HeatMapMode detectó un cambio. Preparando para llamar a la API de OpenWeatherMap con Lat: ${selectedCoords.lat}, Lon: ${selectedCoords.lng}`,
      );

      try {
        // --- ¡LA CORRECCIÓN CLAVE ESTÁ AQUÍ! ---
        // Construimos la URL para llamar directamente a OpenWeatherMap
        const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${selectedCoords.lat}&lon=${selectedCoords.lng}&appid=${apiKey}&units=metric`;
        
        console.log("   Llamando a:", apiUrl); // Útil para depurar la URL
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error de OpenWeatherMap: ${errorData.message || response.statusText}`,
          );
        }

        const data = await response.json();

        // ¡OBJETIVO CUMPLIDO! Mostramos la respuesta en la consola
        console.log('✅ ¡Éxito! Datos recibidos directamente de OpenWeatherMap:', data);
      } catch (error) {
        console.error('❌ Error al llamar a la API de OpenWeatherMap:', error);
      }
    };

    fetchData();
  }, [selectedCoords, apiKey]); // Añadimos apiKey a las dependencias

  // Este componente no renderiza nada visualmente por ahora
  return null;
};

export default HeatMapMode;