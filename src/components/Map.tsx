import { MapPin } from 'lucide-react';

interface MapProps {
  className?: string;
}

const Map = ({ className }: MapProps) => {
  // Coordenadas para São Paulo, SP - Centro (exemplo)
  const latitude = -23.5505;
  const longitude = -46.6333;
  const address = "Rua São Gonçalo, nº 36 – Bairro Santos Dumont";
  
  // URL do Google Maps embed
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-TK7VFC&q=${encodeURIComponent(address)}&zoom=15`;
  
  // URL alternativa usando coordenadas (caso a primeira não funcione)
  const mapUrlCoords = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjgiUyA0NsKwMzcnNTkuOSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890123!5m2!1spt-BR!2sbr`;

  return (
    <div className={className}>
      <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        {/* Mapa usando OpenStreetMap embed */}
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`}
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '8px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização da Smooth Cuts Barbearia"
        />
        
        {/* Overlay com informações */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Smooth Cuts Barbearia</div>
              <div className="text-gray-600">Rua São Gonçalo, nº 36 – Bairro Santos Dumont</div>
              <div className="text-gray-600">São Paulo, SP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;