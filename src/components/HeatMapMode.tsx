import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wind, BrainCircuit, ShieldCheck, ShieldAlert } from 'lucide-react';

// Interfaces para los datos que esperamos de nuestras APIs
interface PollutionData {
  list: { main: { aqi: number }; components: { pm2_5: number; pm10: number; no2: number; }; }[];
}
interface PredictionData {
  anio: number; pm25: number; pm10: number; no2: number; unidades: string;
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
  const markerRef = useRef<L.Marker | null>(null);
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

  useEffect(() => {
    if (!selectedCoords) return;

    const fetchDataAndPredict = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentData(null);
      setPredictionData(null);

      if (!apiKey) {
        setError("La clave de API de OpenWeatherMap no está configurada en .env.local");
        setIsLoading(false);
        return;
      }

      try {
        // URLs para ambas APIs
        const currentApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${selectedCoords.lat}&lon=${selectedCoords.lng}&appid=${apiKey}&units=metric`;
        // La URL de nuestra nueva micro-API Flask
        const predictionApiUrl = `http://127.0.0.1:5000/predict?lat=${selectedCoords.lat}&lon=${selectedCoords.lng}`;
        
        const [currentResponse, predictionResponse] = await Promise.all([
          fetch(currentApiUrl),
          fetch(predictionApiUrl)
        ]);

        if (!currentResponse.ok) throw new Error(`Error en API de datos actuales: ${currentResponse.statusText}`);
        if (!predictionResponse.ok) throw new Error(`Error en API de predicción: ${predictionResponse.statusText}`);

        const currentResult = await currentResponse.json();
        const predictionResult = await predictionResponse.json();

        setCurrentData(currentResult);
        setPredictionData(predictionResult);

      } catch (err: any) {
        setError(err.message || 'No se pudieron obtener los datos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAndPredict();

    if (map) {
      if (markerRef.current) markerRef.current.setLatLng(selectedCoords);
      else markerRef.current = L.marker(selectedCoords).addTo(map);
      map.flyTo(selectedCoords, map.getZoom());
    }
  }, [selectedCoords, map, apiKey]);

  useEffect(() => {
    return () => { if (markerRef.current && map) map.removeLayer(markerRef.current); };
  }, [map]);

  const getSafetyStatus = (pm25: number) => {
    if (pm25 <= 5) return { text: "Seguro", Icon: ShieldCheck, color: "text-green-600" };
    if (pm25 <= 15) return { text: "Moderado", Icon: ShieldAlert, color: "text-yellow-600" };
    return { text: "Peligroso", Icon: ShieldAlert, color: "text-red-600" };
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin w-4 h-4" /> <p>Consultando y Prediciendo...</p></div>;
    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

    if (currentData && predictionData) {
      const safety = getSafetyStatus(predictionData.pm25);
      return (
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
          <div className={`flex items-center justify-center gap-2 p-3 rounded-md border ${safety.color.replace('text-', 'border-').replace('-600', '-200')} ${safety.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
            <safety.Icon className={`w-6 h-6 ${safety.color}`} />
            <p className={`font-bold ${safety.color}`}>Veredicto para {predictionData.anio}: {safety.text}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wind /> Análisis de Contaminación</CardTitle>
        <CardDescription>
          {selectedCoords ? `Resultados para Lat: ${selectedCoords.lat.toFixed(4)}, Lon: ${selectedCoords.lng.toFixed(4)}` : 'Haz clic en el mapa para analizar y predecir.'}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default HeatMapMode;