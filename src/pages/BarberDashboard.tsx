import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { BarberAppointments } from '@/components/BarberAppointments';
import { isBarber, getBarberData } from '@/config/barber';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, AlertCircle } from 'lucide-react';

const BarberDashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorizedBarber, setIsAuthorizedBarber] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Redirecionar para login se não estiver autenticado
          navigate('/auth');
          return;
        }

        setUser(session.user);
        
        // Verificar se o usuário é um barbeiro autorizado
        const userEmail = session.user.email;
        if (userEmail && isBarber(userEmail)) {
          setIsAuthorizedBarber(true);
        } else {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar o painel do barbeiro.",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorizedBarber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Esta área é restrita apenas para barbeiros autorizados.
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador se você deveria ter acesso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const barberData = getBarberData(user.email!);

  return (
    <BarberAppointments 
      barberData={barberData}
      user={user}
    />
  );
};

export default BarberDashboard;