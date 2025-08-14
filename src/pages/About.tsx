import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Award, Clock } from "lucide-react";
const About = () => {
  const stats = [{
    icon: Star,
    label: "Anos de Experiência",
    value: "15+"
  }, {
    icon: Users,
    label: "Clientes Satisfeitos",
    value: "5000+"
  }, {
    icon: Award,
    label: "Prêmios Recebidos",
    value: "12"
  }, {
    icon: Clock,
    label: "Horas de Trabalho",
    value: "10000+"
  }];
  const team = [{
    name: "Carlos Silva",
    role: "Barbeiro Master",
    experience: "10 anos",
    specialty: "Cortes clássicos e modernos"
  }, {
    name: "João Santos",
    role: "Barbeiro Especialista",
    experience: "8 anos",
    specialty: "Barba e bigode"
  }, {
    name: "Pedro Costa",
    role: "Barbeiro Junior",
    experience: "3 anos",
    specialty: "Cortes jovens"
  }];
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Nossa História
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Mais de 15 anos oferecendo o melhor em cortes e cuidados masculinos
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-6">Mateus Barbershop</h2>
                  <p className="text-muted-foreground mb-6">
                    Fundada em 2009, a Mateus Barbershop nasceu da paixão por oferecer 
                    um serviço de excelência no cuidado masculino. Nossa missão é 
                    proporcionar uma experiência única, combinando técnicas tradicionais 
                    com as mais modernas tendências.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Com uma equipe altamente qualificada e um ambiente acolhedor, 
                    nos tornamos referência na cidade, atendendo homens que valorizam 
                    qualidade e estilo.
                  </p>
                </div>
                <div className="bg-gradient-gold rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-bold text-barbershop-black mb-4">
                    Nossa Missão
                  </h3>
                  <p className="text-barbershop-black">
                    Oferecer serviços de barbearia de alta qualidade, 
                    proporcionando aos nossos clientes uma experiência 
                    única e personalizada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Nossos Números
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <stat.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Nossa Equipe
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {team.map((member, index) => <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <div className="w-24 h-24 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-12 h-12 text-barbershop-black" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {member.name}
                      </h3>
                      <p className="text-accent font-medium mb-2">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground text-sm mb-2">
                        {member.experience}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {member.specialty}
                      </p>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default About;