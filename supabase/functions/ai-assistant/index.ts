import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY no está configurado');
    }

    let systemPrompt = '';
    
    // Personalizar el prompt según el tipo de asistencia
    switch (type) {
      case 'news':
        systemPrompt = `Eres un asistente experto en periodismo ambiental. Ayudas a los usuarios a crear noticias impactantes sobre medio ambiente, sostenibilidad y ecología. 
        
        Tu rol es:
        - Sugerir títulos atractivos y precisos
        - Mejorar la redacción de las descripciones
        - Recomendar coordenadas geográficas relevantes
        - Proponer enlaces a fuentes confiables
        - Asegurar que el contenido sea informativo y preciso
        
        Sé conciso, profesional y enfócate en la calidad del contenido ambiental.`;
        break;
      
      case 'event':
        systemPrompt = `Eres un asistente especializado en organización de eventos ambientales. Ayudas a los usuarios a planificar y crear eventos ecológicos efectivos.
        
        Tu rol es:
        - Sugerir nombres atractivos para eventos ambientales
        - Recomendar fechas apropiadas considerando impacto ambiental
        - Ayudar a redactar descripciones que motiven la participación
        - Sugerir ubicaciones estratégicas (coordenadas)
        - Proporcionar ideas para maximizar el impacto del evento
        
        Sé entusiasta, motivador y práctico en tus sugerencias.`;
        break;
      
      default:
        systemPrompt = `Eres un asistente amigable y experto en la plataforma Air Quality Explorer. Ayudas a los usuarios a navegar por la aplicación, entender los mapas de contaminación y utilizar todas las funcionalidades.
        
        La plataforma tiene:
        - Mapa de Calor: visualiza niveles de contaminación con predicción de IA
        - Mapa de Eventos: permite crear y ver eventos ambientales
        - Mapa de Noticias: comparte y consulta noticias ecológicas
        
        Roles de usuario:
        - Todos son "Usuarios de Vista" (pueden ver todo)
        - "Creadores de Noticias" pueden agregar noticias
        - "Creadores de Eventos" pueden agregar eventos
        - Un usuario puede tener múltiples roles
        
        Sé claro, educativo y ayuda al usuario a aprovechar al máximo la plataforma.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Límite de solicitudes excedido. Por favor, intenta más tarde.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Créditos agotados. Por favor, recarga tu cuenta.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const errorText = await response.text();
      console.error('Error de AI gateway:', response.status, errorText);
      throw new Error('Error al procesar la solicitud de IA');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en ai-assistant:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
