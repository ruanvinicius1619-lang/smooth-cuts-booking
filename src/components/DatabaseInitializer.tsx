import React from 'react';
import { useDatabaseSetup } from '@/utils/database-setup';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ErrorDiagnostic from '@/components/ErrorDiagnostic';

interface DatabaseInitializerProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica e inicializa automaticamente o banco de dados
 * Deve envolver a aplicação principal para garantir que o banco está configurado
 */
export const DatabaseInitializer: React.FC<DatabaseInitializerProps> = ({ children }) => {
  const { isReady, isLoading, error } = useDatabaseSetup();
  const isProduction = import.meta.env.PROD;
  const [showDiagnostic, setShowDiagnostic] = React.useState(false);

  // Mostrar diagnóstico automaticamente em produção quando há erro
  React.useEffect(() => {
    if (isProduction && error && !isLoading) {
      setShowDiagnostic(true);
    }
  }, [isProduction, error, isLoading]);

  // Função para recarregar a página (útil após setup manual)
  const handleRetry = () => {
    window.location.reload();
  };

  // Mostra loading durante verificação/setup
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Configurando Banco de Dados</h2>
            <p className="text-slate-300">
              Verificando e configurando as tabelas automaticamente...
            </p>
            <div className="text-sm text-slate-400 space-y-1">
              <p>• Verificando tabelas existentes</p>
              <p>• Executando migrações se necessário</p>
              <p>• Testando conectividade</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostra erro se algo deu errado
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Erro na Configuração</h2>
            <p className="text-slate-300">{error}</p>
          </div>
          
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              <strong>Configuração Manual Necessária:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <p>1. Acesse o painel do Supabase</p>
                <p>2. Vá para SQL Editor</p>
                <p>3. Execute o arquivo: <code className="bg-black/20 px-1 rounded">supabase/migrations/001_create_bookings_tables.sql</code></p>
                <p>4. Ou use: <code className="bg-black/20 px-1 rounded">npm run setup-db</code></p>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
            >
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => setShowDiagnostic(true)}
              variant="outline"
              className="w-full"
            >
              Diagnóstico Avançado
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Consulte <code className="bg-slate-700 px-1 rounded">SETUP_DATABASE.md</code> ou{' '}
                <code className="bg-slate-700 px-1 rounded">SETUP_AUTOMATED.md</code> para mais detalhes
              </p>
            </div>
          </div>
          
          {showDiagnostic && (
            <ErrorDiagnostic onClose={() => setShowDiagnostic(false)} />
          )}
        </div>
      </div>
    );
  }

  // Mostra sucesso e renderiza a aplicação
  if (isReady) {
    return (
      <>
        {/* Indicador discreto de sucesso (opcional) */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-400">DB Ready</span>
          </div>
        </div>
        {children}
        {showDiagnostic && (
          <ErrorDiagnostic onClose={() => setShowDiagnostic(false)} />
        )}
      </>
    );
  }

  // Fallback (não deveria chegar aqui)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Estado Inesperado</h2>
        <p className="text-slate-300 mb-4">Algo deu errado durante a inicialização</p>
        <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
          Recarregar Página
        </Button>
      </div>
    </div>
  );
};

export default DatabaseInitializer;