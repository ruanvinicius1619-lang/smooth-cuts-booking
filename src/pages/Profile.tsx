import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { ArrowLeft, User, Mail, Calendar, Edit2, Save, X, Clock, Scissors, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for bookings
type BookingStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no_show';

interface Booking {
  id: string;
  service_name: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  total_price: number;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data is now loaded from Supabase database

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'default' as const, icon: Clock },
      scheduled: { label: 'Agendado', variant: 'default' as const, icon: Clock },
      completed: { label: 'Concluído', variant: 'secondary' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
      no_show: { label: 'Não Compareceu', variant: 'outline' as const, icon: XCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const loadBookings = async () => {
    if (!user?.id) return;
    
    setBookingsLoading(true);
    try {
      // Load upcoming bookings
      const { data: upcoming, error: upcomingError } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name, price),
          barbers(name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_date', { ascending: true });
      
      if (upcomingError) throw upcomingError;
      
      // Load booking history (completed, cancelled, no_show)
      const { data: history, error: historyError } = await supabase
        .from('bookings')
        .select(`
          *,
          services(name, price),
          barbers(name)
        `)
        .eq('user_id', user.id)
        .in('status', ['completed', 'cancelled', 'no_show'])
        .order('booking_date', { ascending: false });
      
      if (historyError) throw historyError;
      
      // Transform data to match our interface
      const transformBooking = (booking: { 
        id: string;
        services?: { name: string; price: number } | null;
        barbers?: { name: string } | null;
        booking_date: string;
        booking_time: string;
        status: BookingStatus;
        created_at: string;
      }): Booking => ({
        id: booking.id,
        service_name: booking.services?.name || 'Serviço não encontrado',
        barber_name: booking.barbers?.name || 'Barbeiro não encontrado',
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status,
        total_price: booking.services?.price || 0,
        created_at: booking.created_at
      });
      
      setUpcomingBookings(upcoming?.map(transformBooking) || []);
      setBookingHistory(history?.map(transformBooking) || []);
      
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive"
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      // Update booking status in database
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('user_id', user?.id); // Extra security check
      
      if (error) throw error;
      
      // Reload bookings to reflect changes
      await loadBookings();
      
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso"
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar agendamento",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/auth");
          return;
        }

        setUser(session.user);
        setFormData({
          email: session.user.email || "",
          full_name: session.user.user_metadata?.full_name || "",
          phone: session.user.user_metadata?.phone || ""
        });
        
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do perfil",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate, toast]);

  // Load bookings when user changes
  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || ""
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="text-center">Carregando...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Meu Perfil
              </h1>
              <p className="text-xl text-muted-foreground">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dados Pessoais
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Agendamentos
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24">
                          <AvatarFallback className="text-2xl">
                            {getUserInitials(user.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="flex items-center justify-center gap-2">
                        <User className="w-5 h-5" />
                        Informações Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              value={formData.email}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="full_name">Nome Completo</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="Digite seu nome completo"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="Digite seu telefone"
                          />
                        </div>

                        <div>
                          <Label>Membro desde</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <Input
                              value={new Date(user.created_at).toLocaleDateString('pt-BR')}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        {!isEditing ? (
                          <Button onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar Perfil
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={handleCancel}
                              disabled={saving}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleSave}
                              disabled={saving}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {saving ? "Salvando..." : "Salvar"}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Agendamentos em Aberto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : upcomingBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p>Nenhum agendamento em aberto</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcomingBookings.map((booking) => (
                            <div key={booking.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-foreground">{booking.service_name}</h4>
                                    {getStatusBadge(booking.status)}
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      Barbeiro: {booking.barber_name}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      {booking.booking_time}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className="font-medium">R$ {booking.total_price.toFixed(2)}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cancelBooking(booking.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scissors className="w-5 h-5" />
                        Histórico de Serviços
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : bookingHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Scissors className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p>Nenhum serviço realizado ainda</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookingHistory.map((booking) => (
                            <div key={booking.id} className="border border-border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-foreground">{booking.service_name}</h4>
                                    {getStatusBadge(booking.status)}
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      Barbeiro: {booking.barber_name}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      {booking.booking_time}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className="font-medium">R$ {booking.total_price.toFixed(2)}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;