import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Scissors, DollarSign, Filter, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes?: string;
  created_at: string;
  user_id: string;
  services: {
    name: string;
    price: number;
    duration: number;
  } | null;
  barbers: {
    name: string;
  } | null;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
}

interface BarberAppointmentsProps {
  barberData: any;
  user: any;
}

const BarberAppointments: React.FC<BarberAppointmentsProps> = ({ barberData, user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [barberFilter, setBarberFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [barbers, setBarbers] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, dateFilter, barberFilter, serviceFilter, statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do Supabase
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          notes,
          created_at,
          user_id,
          services (name, price, duration),
          barbers (name)
        `)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (error) {
        console.warn('Erro ao buscar dados do Supabase:', error);
      }

      let appointmentsData = data || [];
      
      // Buscar dados do localStorage também
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      
      // Converter dados do localStorage para o formato esperado
      const localAppointments = localBookings.map((booking: any) => ({
        id: booking.id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status,
        notes: booking.notes,
        created_at: booking.created_at,
        user_id: booking.user_id,
        services: { 
          name: booking.service_name, 
          price: booking.service_price,
          duration: null 
        },
        barbers: { 
          name: booking.barber_name 
        },
        user_email: booking.user_email || booking.user_id,
        user_name: booking.user_name || 'Nome não configurado',
        user_phone: booking.user_phone || 'Telefone não configurado'
      }));
      
      // Combinar dados do Supabase e localStorage
      appointmentsData = [...appointmentsData, ...localAppointments];
      
      // Buscar dados dos usuários da tabela profiles
      const uniqueUserIds = [...new Set(appointmentsData.map((apt: any) => apt.user_id).filter(Boolean))];
      let profilesMap = new Map();
      
      console.log('🔍 Buscando perfis para user_ids:', uniqueUserIds);
      
      if (uniqueUserIds.length > 0) {
        // Separar UUIDs de emails
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const userUUIDs = uniqueUserIds.filter(id => uuidPattern.test(id));
        const userEmails = uniqueUserIds.filter(id => !uuidPattern.test(id));
        
        console.log('📧 Emails para buscar:', userEmails);
        console.log('🆔 UUIDs para buscar:', userUUIDs);
        
        // Buscar por email
        if (userEmails.length > 0) {
          const { data: profilesByEmail, error: emailError } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone')
            .in('email', userEmails);
          
          if (emailError) {
            console.warn('Erro ao buscar perfis por email:', emailError);
          } else {
            console.log('✅ Perfis encontrados por email:', profilesByEmail);
            (profilesByEmail || []).forEach(profile => {
              profilesMap.set(profile.email, profile);
              profilesMap.set(profile.id, profile);
            });
          }
        }
        
        // Buscar por UUID
        if (userUUIDs.length > 0) {
          const { data: profilesById, error: idError } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone')
            .in('id', userUUIDs);
          
          if (idError) {
            console.warn('Erro ao buscar perfis por ID:', idError);
          } else {
            console.log('✅ Perfis encontrados por ID:', profilesById);
            (profilesById || []).forEach(profile => {
              profilesMap.set(profile.email, profile);
              profilesMap.set(profile.id, profile);
            });
          }
        }
      }
      
      console.log('🗺️ Mapa de perfis criado:', Array.from(profilesMap.entries()));
      
      // Mapear dados dos usuários com dados reais da tabela profiles
      const appointmentsWithUserData = appointmentsData.map((appointment: any) => {
        const profile = profilesMap.get(appointment.user_id);
        
        console.log(`🔍 Mapeando agendamento ${appointment.id}:`);
        console.log(`   user_id: ${appointment.user_id}`);
        console.log(`   perfil encontrado:`, profile);
        
        return {
          ...appointment,
          user_email: profile?.email || appointment.user_email || appointment.user_id,
          user_name: profile?.full_name || appointment.user_name || 'Nome não configurado',
          user_phone: profile?.phone || appointment.user_phone || 'Telefone não configurado'
        };
      });
      
      // Mostrar TODOS os agendamentos sem filtros
      const clientAppointments = appointmentsWithUserData;
      
      console.log(`📋 Total de agendamentos carregados: ${clientAppointments.length}`);
      clientAppointments.forEach((apt: any) => {
        console.log(`📅 Agendamento: ${apt.user_email} - ${apt.booking_date} ${apt.booking_time}`);
      });
      
      setAppointments(clientAppointments);
      setFilteredAppointments(clientAppointments);
      
      // Extrair barbeiros e serviços únicos para os filtros
      const uniqueBarbers = [...new Set(clientAppointments?.map((apt: any) => apt.barbers?.name).filter(Boolean) || [])];
      const uniqueServices = [...new Set(clientAppointments?.map((apt: any) => apt.services?.name).filter(Boolean) || [])];
      
      setBarbers(uniqueBarbers);
      setServices(uniqueServices);
      
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.booking_date === dateFilter);
    }

    if (barberFilter !== 'all') {
      filtered = filtered.filter(apt => apt.barbers?.name === barberFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(apt => apt.services?.name === serviceFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        console.warn('Erro ao atualizar no Supabase:', error);
      }

      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const bookingIndex = localBookings.findIndex((booking: any) => booking.id === appointmentId);
      
      if (bookingIndex !== -1) {
        localBookings[bookingIndex].status = newStatus;
        localStorage.setItem('userBookings', JSON.stringify(localBookings));
      }

      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso.",
      });

      loadAppointments();
    } catch (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do agendamento.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setDateFilter('');
    setBarberFilter('all');
    setServiceFilter('all');
    setStatusFilter('all');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Barbeiro</h1>
          <p className="text-gray-600 mt-2">Gerencie seus agendamentos e clientes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAppointments} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Barbeiro</label>
              <Select value={barberFilter} onValueChange={setBarberFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os barbeiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os barbeiros</SelectItem>
                  {barbers.map(barber => (
                    <SelectItem key={barber} value={barber}>{barber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Serviço</label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Agendamentos ({filteredAppointments.length})</h2>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{appointment.user_name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.user_email}</p>
                      <p className="text-sm text-gray-600">{appointment.user_phone}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(parseISO(appointment.booking_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{appointment.booking_time}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-gray-500" />
                        <span>{appointment.services?.name || 'Serviço não especificado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{appointment.barbers?.name || 'Barbeiro não especificado'}</span>
                      </div>
                      {appointment.services?.price && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>R$ {appointment.services.price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={appointment.status}
                          onValueChange={(newStatus) => updateAppointmentStatus(appointment.id, newStatus)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Observações:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { BarberAppointments };
export default BarberAppointments;