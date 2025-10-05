import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Newspaper, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface News {
  id: string;
  title: string;
  description: string;
  link?: string;
  lat: number;
  lng: number;
}

interface NewsModeProps {
  map: L.Map | null;
}

const NewsMode = ({ map }: NewsModeProps) => {
  const [news, setNews] = useState<News[]>([
    {
      id: '1',
      title: 'Nueva Reserva Natural Protegida',
      description: 'Se establece una nueva área de conservación de 1000 hectáreas',
      link: 'https://example.com/news1',
      lat: 43.2630,
      lng: -2.9350
    },
    {
      id: '2',
      title: 'Reducción de Emisiones en la Ciudad',
      description: 'Implementación exitosa de zona de bajas emisiones',
      link: 'https://example.com/news2',
      lat: 39.4699,
      lng: -0.3763
    }
  ]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    lat: '',
    lng: ''
  });

  // Custom icon for news markers
  const newsIcon = L.divIcon({
    className: 'custom-news-marker',
    html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8"/>
        <path d="M15 18h-5"/>
        <path d="M10 6h8v4h-8V6Z"/>
      </svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));

    // Add markers for all news
    const newMarkers = news.map(item => {
      const marker = L.marker([item.lat, item.lng], { icon: newsIcon })
        .addTo(map);
      
      marker.on('click', () => {
        setSelectedNews(item);
      });
      
      return marker;
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => map.removeLayer(marker));
    };
  }, [map, news]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newNewsItem: News = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      link: formData.link || undefined,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };

    setNews([...news, newNewsItem]);
    setFormData({ title: '', description: '', link: '', lat: '', lng: '' });
    setShowForm(false);
    toast.success('Noticia agregada correctamente');
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card shadow-card-eco border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Noticias Ambientales</h3>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Noticia
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 bg-muted rounded-lg border border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Título</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enlace (opcional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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

        {selectedNews && (
          <div className="mb-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{selectedNews.title}</h4>
                <p className="text-sm text-muted-foreground mt-2">{selectedNews.description}</p>
                {selectedNews.link && (
                  <a 
                    href={selectedNews.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover mt-2"
                  >
                    Leer más <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedNews(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Noticias Recientes</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {news.map(item => (
              <div 
                key={item.id} 
                className="p-3 bg-muted rounded-md border border-border cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setSelectedNews(item)}
              >
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NewsMode;
