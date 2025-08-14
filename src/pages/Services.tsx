import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Scissors, Award, Star, Clock, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "@/hooks/useAdminData";
import barberService from "@/assets/barber-service.jpg";
import hairStyling from "@/assets/hair-styling.jpg";
import beardGrooming from "@/assets/beard-grooming.jpg";
const Services = () => {
  const navigate = useNavigate();
  const { services: adminServices } = useAdminData();
  
  // Fallback services with images for display
  const servicesWithImages = adminServices.map((service, index) => {
    const images = [barberService, hairStyling, beardGrooming];
    const icons = [Scissors, Star, Award, Sparkles, Users];
    
    return {
      ...service,
      image: images[index % images.length],
      icon: icons[index % icons.length],
      features: [
        "Atendimento personalizado",
        "Produtos de qualidade",
        "Profissionais experientes",
        "Ambiente acolhedor"
      ]
    };
  });
  
  // Keep original static services as fallback
  const staticServices = [{
    id: 1,
    title: "Corte Tradicional",
    description: "Corte clássico com técnicas tradicionais, acabamento profissional e lavagem completa",
    price: "R$ 35",
    duration: "45 min",
    image: barberService,
    icon: Scissors,
    features: ["Consulta personalizada", "Lavagem e condicionador", "Finalização com pomada", "Toalha quente"]
  }, {
    id: 2,
    title: "Corte Moderno",
    description: "Cortes contemporâneos e estilizados com as últimas tendências da moda masculina",
    price: "R$ 45",
    duration: "60 min",
    image: hairStyling,
    icon: Star,
    features: ["Design personalizado", "Técnicas modernas", "Produtos premium", "Styling profissional"]
  }, {
    id: 3,
    title: "Barba Completa",
    description: "Aparar, modelar e cuidar da barba com produtos especializados e técnicas profissionais",
    price: "R$ 30",
    duration: "35 min",
    image: beardGrooming,
    icon: Award,
    features: ["Aparar e modelar", "Óleos nutritivos", "Balm hidratante", "Toalha quente relaxante"]
  }, {
    id: 4,
    title: "Corte + Barba",
    description: "Pacote completo com corte de cabelo e cuidados com a barba para um visual renovado",
    price: "R$ 60",
    duration: "90 min",
    image: beardGrooming,
    icon: Sparkles,
    features: ["Serviço completo", "Economia de R$ 15", "Tratamento premium", "Resultado garantido"]
  }, {
    id: 5,
    title: "Tratamento Capilar",
    description: "Cuidados especiais para cabelo e couro cabeludo com produtos terapêuticos",
    price: "R$ 50",
    duration: "50 min",
    image: hairStyling,
    icon: Star,
    features: ["Análise do cabelo", "Tratamento personalizado", "Massagem relaxante", "Produtos terapêuticos"]
  }, {
    id: 6,
    title: "Experiência Premium",
    description: "O pacote completo com todos os nossos serviços para uma experiência única",
    price: "R$ 95",
    duration: "120 min",
    image: barberService,
    icon: Users,
    features: ["Todos os serviços", "Atendimento VIP", "Bebida incluída", "Massagem relaxante"]
  }];
  const handleBookService = (serviceId: number) => {
    navigate(`/booking?service=${serviceId}`);
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Nossos <span className="text-accent">Serviços</span>
          </h1>
          <p className="text-xl text-barbershop-gray-light max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços premium para o cuidado masculino, 
            combinando tradição e modernidade para resultados excepcionais
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(servicesWithImages.length > 0 ? servicesWithImages : staticServices).map(service => <Card key={service.id} className="overflow-hidden shadow-card hover:shadow-elegant transition-smooth group">
                <div className="relative h-48 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                  <div className="absolute inset-0 bg-gradient-black opacity-40"></div>
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-barbershop-black" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-accent text-barbershop-black px-3 py-1 rounded-full font-semibold">
                    {typeof service.price === 'number' ? `R$ ${service.price}` : service.price}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{service.title || service.name}</h3>
                    <div className="flex items-center text-barbershop-gray">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{service.duration}</span>
                    </div>
                  </div>
                  
                  <p className="text-barbershop-gray mb-4">{service.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-2">Inclui:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => <li key={index} className="text-sm text-barbershop-gray flex items-center">
                          <Star className="w-3 h-3 text-accent mr-2 flex-shrink-0" />
                          {feature}
                        </li>)}
                    </ul>
                  </div>
                  
                  <Button variant="premium" className="w-full" onClick={() => handleBookService(service.id)}>
                    Agendar Serviço
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Por que Escolher a <span className="text-accent"></span>?
            </h2>
            <p className="text-xl text-barbershop-gray max-w-3xl mx-auto">
              Nossa dedicação à excelência nos diferencia das demais barbearias
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-barbershop-black" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Profissionais Qualificados</h3>
              <p className="text-barbershop-gray">
                Barbeiros experientes com mais de 10 anos de carreira e certificações profissionais
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-barbershop-black" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Produtos Premium</h3>
              <p className="text-barbershop-gray">
                Utilizamos apenas produtos de alta qualidade das melhores marcas do mercado
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-barbershop-black" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Ambiente Premium</h3>
              <p className="text-barbershop-gray">
                Espaço moderno e confortável com atendimento personalizado e exclusivo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Transformar seu <span className="text-accent">Visual</span>?
          </h2>
          <p className="text-xl text-barbershop-gray-light mb-8 max-w-2xl mx-auto">
            Agende seu horário agora e descubra a diferença de um serviço verdadeiramente profissional
          </p>
          <Button variant="premium" size="lg" onClick={() => navigate("/booking")} className="text-lg px-8 py-6">
            Agendar Agora
          </Button>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Services;