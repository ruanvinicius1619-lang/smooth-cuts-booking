import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: "Rua São Gonçalo, nº 36\nBairro Santos Dumont"
    },
    {
      icon: Phone,
      title: "Telefone",
      content: "(79) 99646-5615"
    },
    {
      icon: Mail,
      title: "E-mail",
      content: "barberprime01@gmail.com"
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      content: "Ter-Qui: 9h às 12h-14h às 20h\nSex-Sáb: 9h às 12h-14h às 21h\nDom e Seg: Fechado"
    }
  ];

  const socialMedia = [
    { icon: Instagram, name: "Instagram", handle: "@mateusbarbershop99_" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Entre em Contato
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Estamos aqui para atender você da melhor forma possível
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <info.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-foreground mb-3">
                        {info.title}
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-line text-sm">
                        {info.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form and Map */}
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-foreground">
                      Envie uma Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Nome
                        </label>
                        <Input placeholder="Seu nome completo" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Telefone
                        </label>
                        <Input placeholder="(11) 99999-9999" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        E-mail
                      </label>
                      <Input placeholder="seu@email.com" type="email" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Assunto
                      </label>
                      <Input placeholder="Como podemos ajudar?" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Mensagem
                      </label>
                      <Textarea 
                        placeholder="Descreva sua dúvida ou sugestão..."
                        rows={5}
                      />
                    </div>
                    <Button variant="premium" className="w-full">
                      Enviar Mensagem
                    </Button>
                  </CardContent>
                </Card>

                {/* Map and Social */}
                <div className="space-y-8">
                  {/* Map Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground">
                        Nossa Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-accent mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Mapa interativo em breve
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Media */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground">
                        Redes Sociais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {socialMedia.map((social, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <social.icon className="w-6 h-6 text-accent" />
                            <div>
                              <p className="font-medium text-foreground">
                                {social.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {social.handle}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;