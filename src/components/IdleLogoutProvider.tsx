import { useEffect, useState } from 'react';
import { useIdleLogout } from '@/hooks/use-idle-logout';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

interface IdleLogoutProviderProps {
  children: React.ReactNode;
}

/**
 * Componente que gerencia o logout automático por inatividade
 * Deve ser usado como wrapper da aplicação
 */
const IdleLogoutProvider = ({ children }: IdleLogoutProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  // Configurações do logout automático
  const IDLE_TIME = 5 * 60 * 1000; // 5 minutos
  const WARNING_TIME = 1 * 60 * 1000; // 1 minuto de aviso
  const DIALOG_COUNTDOWN = 60; // 60 segundos para decidir

  const {
    forceLogout,
    extendSession,
    stopIdleTimer,
    startIdleTimer
  } = useIdleLogout({
    idleTime: IDLE_TIME,
    warningTime: WARNING_TIME,
    showWarning: false, // Usaremos nosso próprio dialog
    onIdle: () => {
      // Quando detectar inatividade, mostra o dialog de aviso
      if (user) {
        setShowWarningDialog(true);
        setCountdown(DIALOG_COUNTDOWN);
        startCountdown();
      }
    },
    onActive: () => {
      // Quando voltar a ficar ativo, esconde o dialog
      setShowWarningDialog(false);
      stopCountdown();
    }
  });

  /**
   * Inicia a contagem regressiva no dialog
   */
  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Tempo esgotado, faz logout
          clearInterval(interval);
          setShowWarningDialog(false);
          forceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(interval);
  };

  /**
   * Para a contagem regressiva
   */
  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setCountdown(0);
  };

  /**
   * Mantém a sessão ativa
   */
  const handleStayLoggedIn = () => {
    setShowWarningDialog(false);
    stopCountdown();
    extendSession();
  };

  /**
   * Faz logout imediatamente
   */
  const handleLogoutNow = () => {
    setShowWarningDialog(false);
    stopCountdown();
    forceLogout();
  };

  // Monitora mudanças de autenticação
  useEffect(() => {
    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Se fez logout, esconde o dialog e para o countdown
      if (!session?.user) {
        setShowWarningDialog(false);
        stopCountdown();
      }
    });

    return () => {
      subscription.unsubscribe();
      stopCountdown();
    };
  }, []);

  // Cleanup quando o componente é desmontado
  useEffect(() => {
    return () => {
      stopCountdown();
      stopIdleTimer();
    };
  }, [stopIdleTimer]);

  return (
    <>
      {children}
      
      {/* Dialog de aviso de inatividade */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <Clock className="w-5 h-5" />
              Sessão Expirando
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está inativo há algum tempo. Por motivos de segurança, 
                sua sessão será encerrada automaticamente.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 font-medium text-center">
                  ⏰ Logout automático em: <span className="text-lg font-bold">{countdown}s</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Clique em "Continuar Logado" para manter sua sessão ativa.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={handleLogoutNow}
              className="flex items-center gap-2 order-2 sm:order-1"
            >
              <LogOut className="w-4 h-4" />
              Sair Agora
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStayLoggedIn}
              className="flex items-center gap-2 order-1 sm:order-2"
            >
              <RefreshCw className="w-4 h-4" />
              Continuar Logado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IdleLogoutProvider;