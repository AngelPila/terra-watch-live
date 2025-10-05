import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface HeatMapModeProps {
  map: L.Map | null;
}

const HeatMapMode = ({ map }: HeatMapModeProps) => {
  const [heatLayer, setHeatLayer] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);

  useEffect(() => {
    if (!map) return;

    // Generate sample heat data points
    const heatData = [
      [40.4168, -3.7038, 0.8], // Madrid
      [41.3851, 2.1734, 0.6],  // Barcelona
      [39.4699, -0.3763, 0.5], // Valencia
      [37.3891, -5.9845, 0.7], // Sevilla
      [43.2630, -2.9350, 0.4], // Bilbao
      [40.9629, -5.6635, 0.9], // Salamanca
      [42.8782, -8.5448, 0.3], // Santiago
      [38.3452, -0.4810, 0.6], // Alicante
    ];

    // Create heat layer
    const heat = (L as any).heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#00ff00',
        0.3: '#ffff00',
        0.5: '#ffa500',
        0.7: '#ff4500',
        1.0: '#ff0000'
      }
    }).addTo(map);

    setHeatLayer(heat);

    return () => {
      if (heat) {
        map.removeLayer(heat);
      }
    };
  }, [map]);

  const handlePredict = () => {
    if (!selectedDate) {
      setPrediction('Por favor, selecciona una fecha para predecir.');
      return;
    }

    // TODO: Integrar modelo de Machine Learning (TEMPO-based air quality prediction) aquí.
    // Por ahora, mostramos una predicción simulada basada en la fecha
    const date = new Date(selectedDate);
    const predictions = [
      'Nivel bajo de contaminación',
      'Nivel moderado de contaminación',
      'Nivel alto de contaminación',
      'Nivel muy alto de contaminación'
    ];
    
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    setPrediction(`Predicción para ${date.toLocaleDateString('es-ES')}: ${randomPrediction}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card shadow-card-eco border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Predicción de Calidad del Aire</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prediction-date" className="text-sm font-medium text-foreground">
              Selecciona una fecha:
            </label>
            <input
              id="prediction-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button 
            onClick={handlePredict}
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Predecir Contaminación
          </Button>

          {prediction && (
            <div className="p-4 bg-muted rounded-md border border-border">
              <p className="text-sm text-foreground font-medium">{prediction}</p>
              <p className="text-xs text-muted-foreground mt-2">
                * Esta es una predicción simulada. Integración con modelo ML próximamente.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-card shadow-card-eco border-border">
        <h4 className="text-sm font-semibold text-foreground mb-2">Leyenda del Mapa de Calor</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Bajo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Moderado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Alto</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Muy Alto</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeatMapMode;
