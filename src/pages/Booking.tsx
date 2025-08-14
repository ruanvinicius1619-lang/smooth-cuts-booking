import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Scissors, 
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { getServices, getBarbers } from "@/config/admin";
import { useAdminData } from "@/hooks/useAdminData";

const Booking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { services, barbers } = useAdminData();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Authentication listener
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('DEBUG: Auth state changed:', event, session?.user?.email);
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Data is now loaded automatically via useAdminData hook
  console.log('DEBUG: Services loaded:', services);
  console.log('DEBUG: Barbers loaded:', barbers);

  const allTimeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30"
  ];

  // Filter available time slots based on selected date and current time
  const getAvailableTimeSlots = useMemo(() => {
    if (!selectedDate) return allTimeSlots;
    
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (!isToday) {
      return allTimeSlots;
    }
    
    // If it's today, filter out past time slots
    const currentTime = today.getHours() * 60 + today.getMinutes();
    
    return allTimeSlots.filter(timeSlot => {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = hours * 60 + minutes;
      // Add 30 minutes buffer to allow booking
      return slotTime > currentTime + 30;
    });
  }, [selectedDate]);

  const timeSlots = getAvailableTimeSlots;

  // Clear selected time if it's no longer available
  useEffect(() => {
    if (selectedTime && !timeSlots.includes(selectedTime)) {
      setSelectedTime(null);
    }
  }, [timeSlots, selectedTime]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = async () => {
    console.log('=== DEBUG: Iniciando agendamento ===');
    console.log('Usuário:', user);
    
    if (!user) {
      console.log('DEBUG: Usuário não autenticado');
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para confirmar o agendamento.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      if (!selectedServiceData) {
        throw new Error('Serviço não encontrado');
      }
      
      const bookingData = {
        user_id: user.id,
        service_id: selectedService,
        barber_id: selectedBarber,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        status: 'pending',
        notes: null
      };
      
      console.log('DEBUG: Dados do agendamento:', bookingData);
      
      // Create booking locally (without database dependency)
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const localBooking = {
        id: bookingId,
        ...bookingData,
        created_at: new Date().toISOString(),
        service_name: selectedServiceData.name,
        service_price: selectedServiceData.price,
        barber_name: barbers.find(b => b.id === selectedBarber)?.name || 'Barbeiro'
      };
      
      // Store booking in localStorage
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      existingBookings.push(localBooking);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));
      
      console.log('DEBUG: Agendamento criado localmente:', localBooking);
      
      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi criado com sucesso. Você pode visualizá-lo no seu perfil.",
      });
      
      // Redirect to profile page
      navigate("/profile");
      
    } catch (error: Error | unknown) {
      console.error('Error creating booking:', error);
      toast({
        title: "Erro no agendamento",
        description: error instanceof Error ? error.message : "Erro ao criar agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1: return selectedService !== "";
      case 2: return selectedBarber !== "";
      case 3: return selectedDate && selectedTime !== "";
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Agendar Horário
              </h1>
              <p className="text-xl text-muted-foreground">
                Escolha seu serviço, profissional e horário ideal
              </p>
            </div>
          </div>
        </section>

        {/* Booking Steps */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Progress Steps */}
              <div className="flex justify-between mb-12">
                {[
                  { step: 1, title: "Serviço", icon: Scissors },
                  { step: 2, title: "Profissional", icon: User },
                  { step: 3, title: "Data & Hora", icon: CalendarIcon },
                  { step: 4, title: "Confirmação", icon: CheckCircle }
                ].map((item) => (
                  <div key={item.step} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      currentStep >= item.step 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep >= item.step 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    }`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              <Card>
                <CardContent className="p-8">
                  {/* Step 1: Select Service */}
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-6">
                        Escolha seu Serviço
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {services.map((service) => (
                          <Card 
                            key={service.id}
                            className={`cursor-pointer transition-all ${
                              selectedService === service.id 
                                ? "ring-2 ring-accent" 
                                : "hover:shadow-md"
                            }`}
                            onClick={() => setSelectedService(service.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-foreground">
                                  {service.name}
                                </h3>
                                <Badge variant="outline">
                                  {service.duration}
                                </Badge>
                              </div>
                              <p className="text-2xl font-bold text-accent">
                                R$ {service.price}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Select Barber */}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-6">
                        Escolha seu Profissional
                      </h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        {barbers.map((barber) => (
                          <Card 
                            key={barber.id}
                            className={`cursor-pointer transition-all ${
                              selectedBarber === barber.id 
                                ? "ring-2 ring-accent" 
                                : "hover:shadow-md"
                            }`}
                            onClick={() => setSelectedBarber(barber.id)}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="w-16 h-16 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                                <User className="w-8 h-8 text-barbershop-black" />
                              </div>
                              <h3 className="font-bold text-foreground mb-2">
                                {barber.name}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {barber.specialty}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Select Date and Time */}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-6">
                        Escolha Data e Horário
                      </h2>
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                          <h3 className="font-medium text-foreground mb-4">
                            Selecione a Data
                          </h3>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            className="rounded-md border"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground mb-4">
                            Horários Disponíveis
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                                className="justify-center"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {currentStep === 4 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-6">
                        Confirme seu Agendamento
                      </h2>
                      <div className="space-y-6">
                        <div className="bg-muted rounded-lg p-6">
                          <h3 className="font-bold text-foreground mb-4">
                            Resumo do Agendamento
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Serviço:</span>
                              <span className="font-medium text-foreground">
                                {services.find(s => s.id === selectedService)?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Profissional:</span>
                              <span className="font-medium text-foreground">
                                {barbers.find(b => b.id === selectedBarber)?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Data:</span>
                              <span className="font-medium text-foreground">
                                {selectedDate?.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Horário:</span>
                              <span className="font-medium text-foreground">
                                {selectedTime}
                              </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-foreground">Total:</span>
                              <span className="text-accent">
                                R$ {services.find(s => s.id === selectedService)?.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-accent/10 rounded-lg p-4">
                          <p className="text-sm text-foreground">
                            <strong>Atenção:</strong> Para confirmar seu agendamento, você precisa fazer login ou criar uma conta.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                    >
                      Anterior
                    </Button>
                    {currentStep === 4 ? (
                      <Button 
                        variant="premium" 
                        onClick={handleConfirmBooking}
                        disabled={loading}
                      >
                        {loading ? "Confirmando..." : "Confirmar Agendamento"}
                      </Button>
                    ) : (
                      <Button 
                        variant="premium" 
                        onClick={handleNextStep}
                        disabled={!canProceed(currentStep)}
                      >
                        Próximo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;