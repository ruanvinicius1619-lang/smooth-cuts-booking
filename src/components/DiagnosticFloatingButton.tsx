import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorDiagnostic from '@/components/ErrorDiagnostic';
import { useErrorDetection } from '@/hooks/useErrorDetection';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

const DiagnosticFloatingButton = () => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { hasUnhandledErrors, errorCount } = useErrorDetection();
  const isProduction = import.meta.env.PROD;
  
  // Email autorizado para ver o botão de diagnóstico
  const AUTHORIZED_EMAIL = 'egrinaldo19@gmail.com';

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar se o usuário está autorizado
  const isAuthorizedUser = user?.email === AUTHORIZED_EMAIL;

  // Só mostrar em produção ou quando há erros E o usuário está autorizado
  if ((!isProduction && !hasUnhandledErrors) || !isAuthorizedUser) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowDiagnostic(true)}
        className={`fixed bottom-4 right-4 z-40 rounded-full w-12 h-12 p-0 shadow-lg ${
          hasUnhandledErrors 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-yellow-600 hover:bg-yellow-700'
        }`}
        title={`Diagnóstico de Erro${errorCount > 0 ? ` (${errorCount} erros)` : ''}`}
      >
        {hasUnhandledErrors ? (
          <AlertTriangle className="h-6 w-6" />
        ) : (
          <Bug className="h-6 w-6" />
        )}
      </Button>

      {showDiagnostic && (
        <ErrorDiagnostic onClose={() => setShowDiagnostic(false)} />
      )}
    </>
  );
};

export default DiagnosticFloatingButton;