import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import emailjs from '@emailjs/browser';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Map from "@/components/Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Schema de validação do formulário
const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("E-mail inválido"),
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres")
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Configuração do EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      console.log('Configurações EmailJS:', {
        serviceId: serviceId ? 'Configurado' : 'Não configurado',
        templateId: templateId ? 'Configurado' : 'Não configurado',
        publicKey: publicKey ? 'Configurado' : 'Não configurado'
      });
      
      // Verifica se as variáveis de ambiente estão configuradas
      if (!serviceId || !templateId || !publicKey) {
        console.warn('EmailJS não configurado. Dados do formulário:', data);
        toast.info('Configuração de e-mail pendente', {
          description: 'Configure o EmailJS para enviar e-mails reais.'
        });
        
        // Simula envio para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Inicializa EmailJS com a chave pública
        emailjs.init(publicKey);
        
        // Envia e-mail real usando EmailJS
        const templateParams = {
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          to_email: import.meta.env.VITE_CONTACT_EMAIL || 'contato@smoothcuts.com.br'
        };
        
        console.log('Enviando e-mail com parâmetros:', templateParams);
        
        const response = await emailjs.send(serviceId, templateId, templateParams);
        console.log('E-mail enviado com sucesso:', response);
      }
      
      // Mostra toast de sucesso
      toast.success('Mensagem enviada com sucesso!', {
        description: 'Entraremos em contato em breve.'
      });
      
      setIsSubmitted(true);
      reset();
      
      // Reset do estado após 3 segundos
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast.error('Erro ao enviar mensagem', {
        description: 'Tente novamente mais tarde.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: "Rua das Flores, 123 - Centro\nSão Paulo, SP - 01234-567"
    },
    {
      icon: Phone,
      title: "Telefone",
      content: "(11) 9999-8888\n(11) 3333-4444"
    },
    {
      icon: Mail,
      title: "E-mail",
      content: "contato@smoothcuts.com.br\nagendamento@smoothcuts.com.br"
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      content: "Segunda a Sexta: 8h às 20h\nSábado: 8h às 18h\nDomingo: Fechado"
    }
  ];

  const socialMedia = [
    { icon: Instagram, name: "Instagram", handle: "@smoothcuts_oficial" },
    { icon: Facebook, name: "Facebook", handle: "Smooth Cuts Barbearia" }
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
                    <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                      {isSubmitted ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          Mensagem Enviada!
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          Envie uma Mensagem
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Obrigado pelo contato!
                        </h3>
                        <p className="text-muted-foreground">
                          Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Nome *
                            </label>
                            <Input 
                              placeholder="Seu nome completo"
                              {...register("name")}
                              className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Telefone *
                            </label>
                            <Input 
                              placeholder="(11) 99999-9999"
                              {...register("phone")}
                              className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            E-mail *
                          </label>
                          <Input 
                            placeholder="seu@email.com" 
                            type="email"
                            {...register("email")}
                            className={errors.email ? "border-red-500" : ""}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Assunto *
                          </label>
                          <Input 
                            placeholder="Como podemos ajudar?"
                            {...register("subject")}
                            className={errors.subject ? "border-red-500" : ""}
                          />
                          {errors.subject && (
                            <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Mensagem *
                          </label>
                          <Textarea 
                            placeholder="Descreva sua dúvida ou sugestão..."
                            rows={5}
                            {...register("message")}
                            className={errors.message ? "border-red-500" : ""}
                          />
                          {errors.message && (
                            <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                          )}
                        </div>
                        <Button 
                          type="submit"
                          variant="premium" 
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar Mensagem
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          * Campos obrigatórios
                        </p>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Map and Social */}
                <div className="space-y-8">
                  {/* Interactive Map */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground">
                        Nossa Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <Map className="h-full w-full" />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          📍 Rua das Flores, 123 - Centro, São Paulo, SP
                        </p>
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