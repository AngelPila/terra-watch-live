import { useState, useCallback } from 'react';
import L from 'leaflet';
import MapContainer from '@/components/MapContainer';
import HeatMapMode from '@/components/HeatMapMode';
import EventsMode from '@/components/EventsMode';
import NewsMode from '@/components/NewsMode';
import { Button } from '@/components/ui/button';
import { Flame, MapPin, Newspaper } from 'lucide-react';

type MapMode = 'heat' | 'events' | 'news';

const Index = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mode, setMode] = useState<MapMode>('heat');

  const handleMapReady = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-eco shadow-eco">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
            🌿 Air Quality Explorer
          </h1>
          <p className="text-white/90 text-sm md:text-base mt-2">
            Explora y gestiona información ambiental en tiempo real
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setMode('heat')}
            variant={mode === 'heat' ? 'default' : 'outline'}
            className={mode === 'heat' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <Flame className="w-4 h-4 mr-2" />
            Mapa de Calor
          </Button>
          <Button
            onClick={() => setMode('events')}
            variant={mode === 'events' ? 'default' : 'outline'}
            className={mode === 'events' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Eventos
          </Button>
          <Button
            onClick={() => setMode('news')}
            variant={mode === 'news' ? 'default' : 'outline'}
            className={mode === 'news' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Noticias
          </Button>
        </div>

        {/* Map and Controls Grid */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Map */}
          <div className="bg-card rounded-lg shadow-card-eco p-4 border border-border">
            <MapContainer onMapReady={handleMapReady} />
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {mode === 'heat' && <HeatMapMode map={map} />}
            {mode === 'events' && <EventsMode map={map} />}
            {mode === 'news' && <NewsMode map={map} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Data powered by TEMPO | Environmental Awareness Project
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
