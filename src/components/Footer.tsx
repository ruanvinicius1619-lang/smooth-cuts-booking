import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-accent">Smooth Cuts</h3>
            <p className="text-barbershop-gray-light">
              A barbearia premium que combina tradição e modernidade para oferecer a melhor experiência em cuidados masculinos.
            </p>
            <div className="flex space-x-4">
              <Instagram className="w-5 h-5 text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth" />
              <Facebook className="w-5 h-5 text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth" />
              <Twitter className="w-5 h-5 text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-accent">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-barbershop-gray-light">Rua das Barbearias, 123 - Centro</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-barbershop-gray-light">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-barbershop-gray-light">contato@smoothcuts.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-accent">Horário de Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-barbershop-gray-light">Seg - Sex: 9h às 19h</p>
                  <p className="text-barbershop-gray-light">Sáb: 8h às 17h</p>
                  <p className="text-barbershop-gray-light">Dom: Fechado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-accent">Serviços</h4>
            <ul className="space-y-2">
              <li className="text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth">Corte Tradicional</li>
              <li className="text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth">Barba & Bigode</li>
              <li className="text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth">Tratamentos Capilares</li>
              <li className="text-barbershop-gray-light hover:text-accent cursor-pointer transition-smooth">Relaxamento</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-barbershop-charcoal mt-8 pt-8 text-center">
          <p className="text-barbershop-gray-light">
            © 2024 Smooth Cuts. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;