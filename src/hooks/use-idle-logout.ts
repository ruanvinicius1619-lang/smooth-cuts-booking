import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UseIdleLogoutOptions {
  /**
   * Tempo de inatividade em milissegundos antes do logout automático
   * Padrão: 30 minutos (1800000ms)
   */
  idleTime?: number;
  /**
   * Tempo de aviso antes do logout em milissegundos
   * Padrão: 5 minutos (300000ms)
   */
  warningTime?: number;
  /**
   * Se deve mostrar aviso antes do logout
   * Padrão: true
   */
  showWarning?: boolean;
  /**
   * Callback executado quando o usuário fica inativo
   */
  onIdle?: () => void;
  /**
   * Callback executado quando o usuário volta a ficar ativo
   */
  onActive?: () => void;
}

/**
 * Hook para gerenciar logout automático por inatividade
 * 
 * @param options Opções de configuração
 * @returns Objeto com funções de controle
 */
export const useIdleLogout = (options: UseIdleLogoutOptions = {}) => {
  const {
    idleTime = 30 * 60 * 1000, // 30 minutos
    warningTime = 5 * 60 * 1000, // 5 minutos
    showWarning = true,
    onIdle,
    onActive
  } = options;

  const navigate = useNavigate();
  const { toast } = useToast();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);
  const warningShownRef = useRef(false);

  // Eventos que indicam atividade do usuário
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  /**
   * Executa o logout do usuário
   */
  const performLogout = useCallback(async () => {
    try {
      // Primeira tentativa: logout normal
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Segunda tentativa: logout apenas local
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        
        if (localError) {
          // Terceira tentativa: limpeza manual
          localStorage.removeItem('sb-jheywkeofcttgdgquawm-auth-token');
          localStorage.removeItem('supabase.auth.token');
        }
      }
      
      toast({
        title: "Sessão expirada",
        description: "Você foi desconectado por inatividade. Faça login novamente para continuar.",
        variant: "destructive"
      });
      
      navigate('/auth');
    } catch (error) {
      localStorage.clear();
      window.location.href = '/auth';
    }
  }, [navigate, toast]);

  /**
   * Mostra aviso de inatividade
   */
  const showIdleWarning = useCallback(() => {
    if (!warningShownRef.current && showWarning) {
      warningShownRef.current = true;
      
      toast({
        title: "⚠️ Sessão expirando",
        description: `Sua sessão expirará em ${Math.floor(warningTime / 60000)} minutos por inatividade. Mova o mouse ou pressione uma tecla para continuar.`,
        duration: 10000 // 10 segundos
      });
    }
  }, [warningTime, showWarning, toast]);

  /**
   * Reseta os timers de inatividade
   */
  const resetTimer = useCallback(() => {
    // Limpa timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Se estava inativo, marca como ativo novamente
    if (isIdleRef.current) {
      isIdleRef.current = false;
      warningShownRef.current = false;
      onActive?.();
    }

    // Configura timer de aviso
    if (showWarning && warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showIdleWarning();
      }, idleTime - warningTime);
    }

    // Configura timer de logout
    timeoutRef.current = setTimeout(() => {
      isIdleRef.current = true;
      onIdle?.();
      performLogout();
    }, idleTime);
  }, [idleTime, warningTime, showWarning, showIdleWarning, performLogout, onIdle, onActive]);

  /**
   * Verifica se o usuário está autenticado
   */
  const checkAuthStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  }, []);

  /**
   * Inicia o monitoramento de inatividade
   */
  const startIdleTimer = useCallback(() => {
    resetTimer();
    
    // Adiciona listeners para eventos de atividade
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
  }, [resetTimer]);

  /**
   * Para o monitoramento de inatividade
   */
  const stopIdleTimer = useCallback(() => {
    // Remove listeners
    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });

    // Limpa timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset state
    isIdleRef.current = false;
    warningShownRef.current = false;
  }, [resetTimer]);

  /**
   * Força o logout imediatamente
   */
  const forceLogout = useCallback(() => {
    stopIdleTimer();
    performLogout();
  }, [stopIdleTimer, performLogout]);

  /**
   * Estende a sessão resetando o timer
   */
  const extendSession = useCallback(() => {
    warningShownRef.current = false;
    resetTimer();
    
    toast({
      title: "✅ Sessão estendida",
      description: "Sua sessão foi estendida com sucesso.",
      duration: 3000
    });
  }, [resetTimer, toast]);

  // Efeito principal para gerenciar o timer
  useEffect(() => {
    let mounted = true;

    const initializeTimer = async () => {
      if (!mounted) return;
      
      const isAuthenticated = await checkAuthStatus();
      
      if (isAuthenticated && mounted) {
        startIdleTimer();
      }
    };

    initializeTimer();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        startIdleTimer();
      } else {
        stopIdleTimer();
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      stopIdleTimer();
      subscription.unsubscribe();
    };
  }, [startIdleTimer, stopIdleTimer, checkAuthStatus]);

  return {
    /**
     * Força o logout imediatamente
     */
    forceLogout,
    /**
     * Estende a sessão resetando o timer
     */
    extendSession,
    /**
     * Para o monitoramento de inatividade
     */
    stopIdleTimer,
    /**
     * Inicia o monitoramento de inatividade
     */
    startIdleTimer,
    /**
     * Verifica se o usuário está inativo
     */
    isIdle: isIdleRef.current
  };
};

export default useIdleLogout;