import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Scissors, Award, Star, Clock, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cortePigmentacao from "@/assets/corte+pigmentacao.jpeg";
import corteBarba from "@/assets/corte+barba.png";
import corteSobrancelha from "@/assets/corte+sobrancelha.jpeg";
import corteBarbasobrancelha from "@/assets/corte+barba+sobrancelha.jpeg";
import corteTesoura from "@/assets/corte-na-tesoura.jpeg";
import corteDegrade from "@/assets/corte-degrade.jpeg";
import corteNavalhado from "@/assets/corte-navalhado.jpeg";
import contornoPezinho from "@/assets/contorno-pezinho.jpeg";
import selagemCorte from "@/assets/selagem+corte.jpeg";
import { useAdminData } from "@/hooks/useAdminData";
import barberService from "@/assets/barber-service.jpg";
import barba from "@/assets/barba.jpeg";
import hairStyling from "@/assets/hair-styling.jpg";
const Services = () => {
  const navigate = useNavigate();
  const { services: adminServices } = useAdminData();
  
  // Fallback services with images for display
  const servicesWithImages = adminServices.map((service, index) => {
    const images = [cortePigmentacao, corteBarba, corteSobrancelha, corteBarbasobrancelha, corteTesoura, corteDegrade, corteNavalhado, barba, contornoPezinho, selagemCorte];
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
    title: "Corte + Pigmentação",
    description: "Corte moderno com pigmentação para realçar o visual e cobrir fios grisalhos",
    price: "R$ 45",
    duration: "50 min",
    image: cortePigmentacao,
    icon: Scissors,
    features: ["Corte personalizado", "Pigmentação profissional", "Produtos premium", "Acabamento impecável"]
  }, {
    id: 2,
    title: "Corte + Barba",
    description: "Combo completo com corte de cabelo e barba modelada para um visual renovado",
    price: "R$ 50",
    duration: "40 min",
    image: corteBarba,
    icon: Award,
    features: ["Corte estilizado", "Barba modelada", "Óleos nutritivos", "Toalha quente"]
  }, {
    id: 3,
    title: "Corte + Sobrancelhas",
    description: "Corte de cabelo com design e modelagem de sobrancelhas para um look completo",
    price: "R$ 60",
    duration: "50 min",
    image: corteSobrancelha,
    icon: Star,
    features: ["Corte profissional", "Design de sobrancelhas", "Acabamento detalhado", "Visual harmonioso"]
  }, {
    id: 4,
    title: "Corte + Barba + Sobrancelhas",
    description: "Pacote completo com todos os cuidados para um visual impecável",
    price: "R$ 60",
    duration: "60 min",
    image: corteBarbasobrancelha,
    icon: Sparkles,
    features: ["Serviço completo", "Visual harmonioso", "Acabamento premium", "Resultado garantido"]
  }, {
    id: 5,
    title: "Corte na Tesoura",
    description: "Corte tradicional feito exclusivamente na tesoura para um acabamento clássico",
    price: "R$ 45",
    duration: "35 min",
    image: corteTesoura,
    icon: Scissors,
    features: ["Técnica tradicional", "Corte na tesoura", "Acabamento clássico", "Precisão artesanal"]
  }, {
    id: 6,
    title: "Corte Degradê",
    description: "Corte moderno com degradê nas laterais para um visual contemporâneo",
    price: "R$ 40",
    duration: "30 min",
    image: corteDegrade,
    icon: Star,
    features: ["Degradê profissional", "Técnicas modernas", "Visual contemporâneo", "Acabamento preciso"]
  }, {
    id: 7,
    title: "Corte Navalhado",
    description: "Corte com acabamento na navalha para um visual mais definido e marcante",
    price: "R$ 40",
    duration: "30 min",
    image: corteNavalhado,
    icon: Award,
    features: ["Acabamento na navalha", "Visual definido", "Técnica especializada", "Resultado marcante"]
  }, {
    id: 8,
    title: "Barba",
    description: "Aparar e modelar a barba com produtos especializados e técnicas profissionais",
    price: "R$ 25",
    duration: "20 min",
    image: barba,
    icon: Award,
    features: ["Aparar e modelar", "Óleos nutritivos", "Balm hidratante", "Toalha quente"]
  }, {
    id: 9,
    title: "Contorno Pezinho",
    description: "Acabamento e contorno do pezinho para um visual sempre alinhado",
    price: "R$ 20",
    duration: "15 min",
    image: contornoPezinho,
    icon: Scissors,
    features: ["Contorno preciso", "Acabamento profissional", "Visual alinhado", "Manutenção rápida"]
  }, {
    id: 10,
    title: "Corte + Selagem",
    description: "Corte com tratamento de selagem para cabelos mais saudáveis e brilhantes",
    price: "R$ 120",
    duration: "90 min",
    image: selagemCorte,
    icon: Sparkles,
    features: ["Corte personalizado", "Tratamento de selagem", "Produtos premium", "Cabelos revitalizados"]
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
            Oferecemos uma gama completa de serviços  para o cuidado masculino, 
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
              Por que Escolher a <span className="text-accent">Mateus Barbershop</span>?
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
                Barbeiros experientes com mais de 9 anos de carreira e certificações profissionais
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
                Espaço confortável com atendimento personalizado e exclusivo
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