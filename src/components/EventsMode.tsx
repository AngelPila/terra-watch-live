import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  lat: number;
  lng: number;
}

interface EventsModeProps {
  map: L.Map | null;
}

const EventsMode = ({ map }: EventsModeProps) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Limpieza de Playa',
      date: '2025-10-15',
      description: 'Evento comunitario de limpieza costera',
      lat: 41.3851,
      lng: 2.1734
    },
    {
      id: '2',
      name: 'Plantación de Árboles',
      date: '2025-10-20',
      description: 'Campaña de reforestación urbana',
      lat: 40.4168,
      lng: -3.7038
    }
  ]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));

    // Add markers for all events
    const newMarkers = events.map(event => {
      const marker = L.marker([event.lat, event.lng])
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: Event = {
      id: Date.now().toString(),
      name: formData.name,
      date: formData.date,
      description: formData.description,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };

    setEvents([...events, newEvent]);
    setFormData({ name: '', date: '', description: '', lat: '', lng: '' });
    setShowForm(false);
    toast.success('Evento agregado correctamente');
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card shadow-card-eco border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Eventos Ambientales</h3>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Evento
          </Button>
        </div>

        {showForm && (
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
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground">
                Agregar
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
            {events.map(event => (
              <div key={event.id} className="p-3 bg-muted rounded-md border border-border">
                <p className="font-medium text-sm text-foreground">{event.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('es-ES')}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventsMode;
