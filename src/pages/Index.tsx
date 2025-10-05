import { useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

import MapContainer from '@/components/MapContainer';
import HeatMapMode from '@/components/HeatMapMode';
import EventsMode from '@/components/EventsMode';
import NewsMode from '@/components/NewsMode';
import EcoFeedMode from '@/components/EcoFeedMode'; // <-- NUEVO

import AIAssistant from '@/components/AIAssistant';
import GodModePanel from '@/components/GodModePanel';
import { Button } from '@/components/ui/button';
import { Flame, MapPin, Newspaper, LogOut, User, Shield, Leaf } from 'lucide-react'; // <-- Leaf NUEVO
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

// Añadimos 'eco' al tipo
type MapMode = 'heat' | 'events' | 'news' | 'god' | 'eco';

const Index = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mode, setMode] = useState<MapMode>('heat');
  const [selectedCoords, setSelectedCoords] = useState<L.LatLng | null>(null);

  const { user, signOut, loading: authLoading } = useAuth();
  const { canCreateEvents, canCreateNews, isGod, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const handleMapReady = useCallback((mapInstance: L.Map) => setMap(mapInstance), []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada correctamente');
  };

  // El clic en el mapa solo activa análisis en el modo 'heat'
  const handleMapClick = (coords: L.LatLng) => {
    if (mode === 'heat') setSelectedCoords(coords);
  };

  // Limpiar coords al cambiar de modo para reiniciar panel
  useEffect(() => {
    setSelectedCoords(null);
  }, [mode]);

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header con navbar y cerrar sesión */}
      <header className="bg-gradient-eco shadow-eco">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                🌿 Air Quality Explorer
              </h1>
              <p className="text-white/90 text-sm md:text-base mt-2">
                Explora y gestiona información ambiental en tiempo real
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white text-right hidden sm:block">
                <p className="text-sm opacity-90">Bienvenido</p>
                <p className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <Button onClick={handleSignOut} variant="secondary" size="sm" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Selector de modo (ahora incluye EcoFeed) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setMode('heat')}
            variant={mode === 'heat' ? 'default' : 'outline'}
            className={mode === 'heat' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <Flame className="w-4 h-4 mr-2" /> Mapa de Calor
          </Button>

          <Button
            onClick={() => setMode('eco')}
            variant={mode === 'eco' ? 'default' : 'outline'}
            className={mode === 'eco' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <Leaf className="w-4 h-4 mr-2" /> EcoFeed
          </Button>

          <Button
            onClick={() => setMode('events')}
            variant={mode === 'events' ? 'default' : 'outline'}
            className={mode === 'events' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <MapPin className="w-4 h-4 mr-2" /> Eventos
          </Button>

          <Button
            onClick={() => setMode('news')}
            variant={mode === 'news' ? 'default' : 'outline'}
            className={mode === 'news' ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : ''}
          >
            <Newspaper className="w-4 h-4 mr-2" /> Noticias
          </Button>

          {isGod && (
            <Button
              onClick={() => setMode('god')}
              variant={mode === 'god' ? 'default' : 'outline'}
              className={mode === 'god' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-400 text-purple-600 hover:bg-purple-50'}
            >
              <Shield className="w-4 h-4 mr-2" /> God Mode
            </Button>
          )}
        </div>

        {/* Grid principal: mapa + panel derecho */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {mode !== 'god' && (
            <div className="bg-card rounded-lg shadow-card-eco p-4 border border-border">
              <MapContainer onMapReady={handleMapReady} onMapClick={handleMapClick} />
            </div>
          )}

          <div className={mode === 'god' ? 'lg:col-span-2' : 'space-y-4'}>
            {mode === 'heat' && <HeatMapMode map={map} selectedCoords={selectedCoords} />}
            {mode === 'eco' && <EcoFeedMode />} {/* NUEVO */}
            {mode === 'events' && <EventsMode map={map} canCreate={canCreateEvents} />}
            {mode === 'news' && <NewsMode map={map} canCreate={canCreateNews} />}
            {mode === 'god' && isGod && <GodModePanel />}
          </div>
        </div>
      </main>

      {/* Asistente IA (igual que antes) */}
      <AIAssistant type={mode === 'events' ? 'event' : mode === 'news' ? 'news' : 'general'} />

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
