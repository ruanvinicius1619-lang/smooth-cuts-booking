import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Star, Scissors, Clock, Award, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import heroImage from "@/assets/barbershop-hero.jpg";
import barberService from "@/assets/barber-service.jpg";
import hairStyling from "@/assets/hair-styling.jpg";
import beardGrooming from "@/assets/beard-grooming.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      console.log('Auth state changed:', event, session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const testLogout = async () => {
    console.log('Testando logout...');
    try {
      // Primeira tentativa: logout normal
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Erro no logout normal, tentando logout local:', error);
        
        // Segunda tentativa: logout apenas local
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        
        if (localError) {
          console.warn('Erro no logout local, forçando limpeza manual:', localError);
          
          // Terceira tentativa: limpeza manual
          localStorage.removeItem('sb-jheywkeofcttgdgquawm-auth-token');
          localStorage.removeItem('supabase.auth.token');
          
          // Força atualização do estado
          window.location.reload();
          return;
        }
      }
      
      console.log('Logout de teste realizado com sucesso');
    } catch (error) {
      console.error('Erro inesperado no logout de teste, forçando limpeza:', error);
      localStorage.clear();
      window.location.reload();
    }
  };

  const services = [
    {
      id: 1,
      title: "Corte Tradicional",
      description: "Corte clássico com acabamento profissional",
      price: "R$ 35",
      image: barberService,
      icon: Scissors
    },
    {
      id: 2,
      title: "Corte + Barba",
      description: "Pacote completo com corte e barba",
      price: "R$ 50",
      image: beardGrooming,
      icon: Award
    },
    {
      id: 3,
      title: "Tratamentos",
      description: "Cuidados especiais para cabelo e couro cabeludo",
      price: "R$ 45",
      image: hairStyling,
      icon: Star
    }
  ];

  const stats = [
    { icon: Users, label: "Clientes Satisfeitos", value: "2.500+" },
    { icon: Star, label: "Avaliação Média", value: "4.9/5" },
    { icon: Award, label: "Anos de Experiência", value: "15+" },
    { icon: Clock, label: "Horários Disponíveis", value: "12h/dia" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onBookingClick={() => navigate("/booking")} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Estilo e <span className="text-accent">Elegância</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-barbershop-gray-light animate-fade-in">
            A experiência completa em cuidados masculinos com o melhor da tradição e modernidade
          </p>
          {user && (
            <p className="text-sm text-green-400 mb-4">
              Logado como: {user.email}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button 
              variant="premium" 
              size="lg"
              onClick={() => navigate("/booking")}
              className="text-lg px-8 py-6"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Agora
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/services")}
              className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Ver Serviços
            </Button>
            {user && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={testLogout}
                className="text-lg px-8 py-6 bg-red-500 text-white hover:bg-red-600"
              >
                Teste Logout
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-barbershop-black" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{stat.value}</h3>
                <p className="text-barbershop-gray">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Nossos <span className="text-accent">Serviços</span>
            </h2>
            <p className="text-xl text-barbershop-gray max-w-2xl mx-auto">
              Oferecemos os melhores serviços de barbearia com profissionais qualificados e produtos premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden shadow-card hover:shadow-elegant transition-smooth group cursor-pointer"
                onClick={() => navigate("/booking")}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-black opacity-40 group-hover:opacity-60 transition-smooth"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-barbershop-black" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                    <span className="text-2xl font-bold text-accent">{service.price}</span>
                  </div>
                  <p className="text-barbershop-gray mb-4">{service.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/services");
                    }}
                  >
                    Selecionar Serviço
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="premium" 
              size="lg"
              onClick={() => navigate("/services")}
            >
              Ver Todos os Serviços
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary-foreground mb-6">
                Tradição e <span className="text-accent">Modernidade</span>
              </h2>
              <p className="text-xl text-barbershop-gray-light mb-6">
                Há mais de 15 anos oferecendo o melhor em cuidados masculinos. Nossa equipe é formada por profissionais experientes e apaixonados pela arte da barbearia.
              </p>
              <p className="text-lg text-barbershop-gray-light mb-8">
                Combinamos técnicas tradicionais com equipamentos modernos para garantir a melhor experiência para nossos clientes.
              </p>
              <Button 
                variant="premium"
                onClick={() => navigate("/about")}
              >
                Conheça Nossa História
              </Button>
            </div>
            <div className="relative">
              <img 
                src={barberService} 
                alt="Nossa equipe" 
                className="w-full rounded-lg shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para uma Nova <span className="text-accent">Experiência</span>?
          </h2>
          <p className="text-xl text-barbershop-gray-light mb-8 max-w-2xl mx-auto">
            Agende seu horário e descubra por que somos a barbearia preferida da região
          </p>
          <Button 
            variant="premium" 
            size="lg"
            onClick={() => navigate("/booking")}
            className="text-lg px-8 py-6"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Meu Horário
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;