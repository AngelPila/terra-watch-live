import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  latitude: number;
  longitude: number;
  created_by: string;
}

interface EventsModeProps {
  map: L.Map | null;
  canCreate: boolean;
}

const EventsMode = ({ map, canCreate }: EventsModeProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    lat: '',
    lng: ''
  });

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        toast.error('Error al cargar eventos');
        return;
      }

      setEvents(data.map(e => ({
        id: e.id,
        name: e.name,
        date: e.date,
        description: e.description,
        latitude: e.latitude,
        longitude: e.longitude,
        created_by: e.created_by
      })));
    };

    fetchEvents();
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!map) return;

    markers.forEach(marker => map.removeLayer(marker));

    const newMarkers = events.map(event => {
      const marker = L.marker([event.latitude, event.longitude])
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${event.name}</h3>
            <p class="text-xs text-gray-600">${new Date(event.date).toLocaleDateString('es-ES')}</p>
            <p class="text-xs mt-1">${event.description}</p>
          </div>
        `)
        .addTo(map);
      
      return marker;
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => map.removeLayer(marker));
    };
  }, [map, events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          name: formData.name,
          date: formData.date,
          description: formData.description,
          latitude: parseFloat(formData.lat),
          longitude: parseFloat(formData.lng),
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        toast.error('Error al crear evento. Verifica tus permisos.');
        return;
      }

      const newEvent: Event = {
        id: data.id,
        name: data.name,
        date: data.date,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        created_by: data.created_by
      };

      setEvents([newEvent, ...events]);
      setFormData({ name: '', date: '', description: '', lat: '', lng: '' });
      setShowForm(false);
      toast.success('Evento creado correctamente');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error inesperado al crear evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card shadow-card-eco border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Eventos Ambientales</h3>
          </div>
          {canCreate ? (
            <Button 
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Evento
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Solo creadores</span>
            </div>
          )}
        </div>

        {showForm && canCreate && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 bg-muted rounded-lg border border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre del Evento</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fecha</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Latitud</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Longitud</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                {loading ? 'Creando...' : 'Agregar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Eventos Registrados</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay eventos registrados
              </p>
            ) : (
              events.map(event => (
                <div key={event.id} className="p-3 bg-muted rounded-md border border-border">
                  <p className="font-medium text-sm text-foreground">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('es-ES')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventsMode;
