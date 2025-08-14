import React, { useState } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorDiagnostic from '@/components/ErrorDiagnostic';
import { useErrorDetection } from '@/hooks/useErrorDetection';

const DiagnosticFloatingButton = () => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const { hasUnhandledErrors, errorCount } = useErrorDetection();
  const isProduction = import.meta.env.PROD;

  // Só mostrar em produção ou quando há erros
  if (!isProduction && !hasUnhandledErrors) {
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