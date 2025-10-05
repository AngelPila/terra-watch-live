import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wind, BrainCircuit, ShieldCheck, ShieldAlert } from 'lucide-react';

// Interfaces (puedes ajustarlas si quieres tipado más estricto)
interface PollutionData {
  list: { main: { aqi: number }; components: { pm2_5: number; pm10: number; no2: number; }; }[];
}
interface PredictionData {
  anio: number;
  pm25: number;
  pm10: number;
  no2: number;
  unidades: string;
}

interface HeatMapModeProps {
  map: L.Map | null;
  selectedCoords: L.LatLng | null;
}

const HeatMapMode = ({ map, selectedCoords }: HeatMapModeProps) => {
  const [currentData, setCurrentData] = useState<PollutionData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // EFECTO 1: Dibujar el mapa coroplético global (solo visual)
  useEffect(() => {
    if (!map) return;

    const getColorForAqi = (aqi: number | undefined) =>
      aqi === undefined ? '#d3d3d3' :
      aqi > 4 ? '#ff0000' :
      aqi > 3 ? '#ff4500' :
      aqi > 2 ? '#ffa500' :
      aqi > 1 ? '#ffff00' : '#00ff00';

    // Más transparencia
    const style = (feature: any) => ({
      fillColor: getColorForAqi(feature.properties.aqi),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.4,
    });

    const fetchDataAndDrawMap = async () => {
      try {
        const [aqiResponse, geoJsonResponse] = await Promise.all([
          fetch('http://127.0.0.1:5000/global-aqi'),
          fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'),
        ]);

        if (!aqiResponse.ok) {
          console.error('Error fetching global-aqi:', aqiResponse.statusText);
          return;
        }
        if (!geoJsonResponse.ok) {
          console.error('Error fetching countries geojson:', geoJsonResponse.statusText);
          return;
        }

        const airQualityData = await aqiResponse.json(); // formato esperado: { "ESP": { aqi: 1 }, ... }
        const geoJsonData = await geoJsonResponse.json();

        // Agregar la propiedad aqi a cada feature cuando exista
        geoJsonData.features.forEach((f: any) => {
          if (f && f.id && airQualityData[f.id]) {
            f.properties = f.properties || {};
            f.properties.aqi = airQualityData[f.id].aqi;
          }
        });

        // Si hay una capa anterior, eliminarla
        if (geoJsonLayerRef.current) {
          try { map.removeLayer(geoJsonLayerRef.current); } catch {}
          geoJsonLayerRef.current = null;
        }

        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style,
          onEachFeature: (feature, layer) => {
            // Solo tooltip informativo, no manejamos clic aquí
            const name = feature.properties?.name || 'Desconocido';
            const aqi = feature.properties?.aqi ?? 'N/A';
            layer.bindTooltip(`<b>${name}</b><br/>AQI: ${aqi}`);
          },
        }).addTo(map);

        geoJsonLayerRef.current = geoJsonLayer;
      } catch (err) {
        console.error('Error al cargar mapa global:', err);
      }
    };

    fetchDataAndDrawMap();

    return () => {
      try {
        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
          geoJsonLayerRef.current = null;
        }
      } catch {}
    };
  }, [map]);

  // EFECTO 2: Obtener datos detallados y predicción cuando selectedCoords cambia (clic en mapa)
  useEffect(() => {
    if (!map) return;

    // Si selectedCoords se anula, limpiamos marcador y datos
    if (!selectedCoords) {
      if (markerRef.current) {
        try { map.removeLayer(markerRef.current); } catch {}
        markerRef.current = null;
      }
      setCurrentData(null);
      setPredictionData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Poner o mover marcador al punto clicado
    if (markerRef.current) {
      markerRef.current.setLatLng(selectedCoords);
    } else {
      markerRef.current = L.marker(selectedCoords).addTo(map);
    }

    // Opcional: centrar suavemente en el punto
    try {
      map.flyTo(selectedCoords, Math.max(map.getZoom(), 6));
    } catch {}

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
      if (!apiKey) {
        setError('La clave de OpenWeatherMap no está configurada en VITE_OPENWEATHERMAP_API_KEY');
        setIsLoading(false);
        return;
      }

      const currentApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${selectedCoords.lat}&lon=${selectedCoords.lng}&appid=${apiKey}`;
      const predictionApiUrl = `http://127.0.0.1:5000/predict?lat=${selectedCoords.lat}&lon=${selectedCoords.lng}`;

      try {
        const [currentResponse, predictionResponse] = await Promise.all([
          fetch(currentApiUrl),
          fetch(predictionApiUrl),
        ]);

        if (!currentResponse.ok) {
          const text = await currentResponse.text();
          throw new Error(`Error en API actual: ${currentResponse.status} ${text || currentResponse.statusText}`);
        }
        if (!predictionResponse.ok) {
          const text = await predictionResponse.text();
          throw new Error(`Error en API de predicción: ${predictionResponse.status} ${text || predictionResponse.statusText}`);
        }

        const currentJson: PollutionData = await currentResponse.json();
        const predictionJson: PredictionData = await predictionResponse.json();

        setCurrentData(currentJson);
        setPredictionData(predictionJson);
      } catch (err: any) {
        console.error('Error fetching details:', err);
        setError(err.message || 'Error desconocido al obtener datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();

    // cleanup si se cambia selectedCoords antes de finalizar (no strictly necessary aquí)
    return () => {};
  }, [selectedCoords, map]);

  // Función para evaluar seguridad en base a pm2.5
  const getSafetyStatus = (pm25: number | undefined) => {
    if (pm25 === undefined || pm25 === null) return { text: 'Desconocido', Icon: ShieldAlert, color: 'text-gray-600' };
    if (pm25 <= 5) return { text: 'Seguro', Icon: ShieldCheck, color: 'text-green-600' };
    if (pm25 <= 15) return { text: 'Moderado', Icon: ShieldAlert, color: 'text-yellow-600' };
    return { text: 'Peligroso', Icon: ShieldAlert, color: 'text-red-600' };
  };

  // Renderizado
  return (
    <div>
      {!selectedCoords ? (
        <Card className="p-4 bg-card shadow-card-eco border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">Leyenda de Calidad del Aire (AQI)</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><div style={{ width: 16, height: 16, backgroundColor: '#00ff00', opacity: 0.7, border: '1px solid #ccc' }}></div><span>1: Bueno</span></div>
            <div className="flex items-center gap-2"><div style={{ width: 16, height: 16, backgroundColor: '#ffff00', opacity: 0.7, border: '1px solid #ccc' }}></div><span>2: Aceptable</span></div>
            <div className="flex items-center gap-2"><div style={{ width: 16, height: 16, backgroundColor: '#ffa500', opacity: 0.7, border: '1px solid #ccc' }}></div><span>3: Moderado</span></div>
            <div className="flex items-center gap-2"><div style={{ width: 16, height: 16, backgroundColor: '#ff4500', opacity: 0.7, border: '1px solid #ccc' }}></div><span>4: Malo</span></div>
            <div className="flex items-center gap-2"><div style={{ width: 16, height: 16, backgroundColor: '#ff0000', opacity: 0.7, border: '1px solid #ccc' }}></div><span>5: Peligroso</span></div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wind /> Análisis de Contaminación</CardTitle>
            <CardDescription>
              {`Análisis para Lat: ${selectedCoords.lat.toFixed(4)}, Lon: ${selectedCoords.lng.toFixed(4)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin w-4 h-4" /> <p>Cargando detalles...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLoading && currentData && predictionData && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Situación Actual</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm p-2 bg-muted rounded-md">
                    <div><p className="text-muted-foreground">PM2.5</p><p className="font-bold">{currentData.list[0].components.pm2_5.toFixed(2)}</p></div>
                    <div><p className="text-muted-foreground">PM10</p><p className="font-bold">{currentData.list[0].components.pm10.toFixed(2)}</p></div>
                    <div><p className="text-muted-foreground">NO₂</p><p className="font-bold">{currentData.list[0].components.no2.toFixed(2)}</p></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Predicción para {predictionData.anio}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm p-2 bg-muted rounded-md">
                    <div><p className="text-muted-foreground">PM2.5</p><p className="font-bold">{predictionData.pm25.toFixed(2)}</p></div>
                    <div><p className="text-muted-foreground">PM10</p><p className="font-bold">{predictionData.pm10.toFixed(2)}</p></div>
                    <div><p className="text-muted-foreground">NO₂</p><p className="font-bold">{predictionData.no2.toFixed(2)}</p></div>
                  </div>
                </div>

                {/* Veredicto basado en PM2.5 pronosticado */}
                {(() => {
                  const verdict = getSafetyStatus(predictionData.pm25);
                  const BorderClass = verdict.color.replace('text-', 'border-').replace('-600', '-200');
                  const BgClass = verdict.color.replace('text-', 'bg-').replace('-600', '-50');
                  return (
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-md border ${BorderClass} ${BgClass}`}>
                      <verdict.Icon className={`w-6 h-6 ${verdict.color}`} />
                      <p className={`font-bold ${verdict.color}`}>Veredicto para {predictionData.anio}: {verdict.text}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HeatMapMode;
