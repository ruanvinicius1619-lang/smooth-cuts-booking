import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useErrorDetection } from '@/hooks/useErrorDetection';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

interface ErrorDiagnosticProps {
  onClose?: () => void;
}

const ErrorDiagnostic: React.FC<ErrorDiagnosticProps> = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { errors, getRecentErrors, clearErrors } = useErrorDetection();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Verificar variáveis de ambiente
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      results.push({
        name: 'Variável VITE_SUPABASE_URL',
        status: 'error',
        message: 'URL do Supabase não configurada ou usando valor padrão',
        details: `Valor atual: ${supabaseUrl || 'undefined'}`
      });
    } else {
      results.push({
        name: 'Variável VITE_SUPABASE_URL',
        status: 'success',
        message: 'URL do Supabase configurada corretamente',
        details: supabaseUrl
      });
    }

    if (!supabaseKey || supabaseKey === 'your-anon-key') {
      results.push({
        name: 'Variável VITE_SUPABASE_ANON_KEY',
        status: 'error',
        message: 'Chave anônima do Supabase não configurada ou usando valor padrão',
        details: 'Chave não definida ou valor padrão'
      });
    } else {
      results.push({
        name: 'Variável VITE_SUPABASE_ANON_KEY',
        status: 'success',
        message: 'Chave anônima do Supabase configurada',
        details: `${supabaseKey.substring(0, 20)}...`
      });
    }

    // 2. Testar conectividade com Supabase
    try {
      const { data, error } = await supabase.from('services').select('count').limit(1);
      if (error) {
        results.push({
          name: 'Conectividade Supabase',
          status: 'error',
          message: 'Erro ao conectar com o Supabase',
          details: error.message
        });
      } else {
        results.push({
          name: 'Conectividade Supabase',
          status: 'success',
          message: 'Conexão com Supabase estabelecida com sucesso'
        });
      }
    } catch (err) {
      results.push({
        name: 'Conectividade Supabase',
        status: 'error',
        message: 'Falha na conexão com Supabase',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // 3. Verificar se as tabelas existem
    try {
      const tables = ['services', 'barbers', 'bookings'];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          if (error) {
            results.push({
              name: `Tabela ${table}`,
              status: 'error',
              message: `Tabela ${table} não encontrada ou inacessível`,
              details: error.message
            });
          } else {
            results.push({
              name: `Tabela ${table}`,
              status: 'success',
              message: `Tabela ${table} acessível`
            });
          }
        } catch (err) {
          results.push({
            name: `Tabela ${table}`,
            status: 'error',
            message: `Erro ao verificar tabela ${table}`,
            details: err instanceof Error ? err.message : 'Erro desconhecido'
          });
        }
      }
    } catch (err) {
      results.push({
        name: 'Verificação de Tabelas',
        status: 'error',
        message: 'Erro geral na verificação de tabelas',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // 4. Verificar ambiente de produção
    const isProduction = import.meta.env.PROD;
    results.push({
      name: 'Ambiente',
      status: isProduction ? 'warning' : 'warning',
      message: isProduction ? 'Executando em produção' : 'Executando em desenvolvimento',
      details: `NODE_ENV: ${import.meta.env.MODE}`
    });

    // 5. Verificar erros capturados
    const recentErrors = getRecentErrors(10); // Últimos 10 minutos
    if (recentErrors.length > 0) {
      results.push({
        name: 'Erros Capturados',
        status: 'error',
        message: `${recentErrors.length} erro(s) encontrado(s) recentemente`,
        details: recentErrors.slice(0, 3).map(e => e.message).join('; ')
      });
    } else {
      results.push({
        name: 'Erros Capturados',
        status: 'success',
        message: 'Nenhum erro recente detectado'
      });
    }

    // 6. Verificar total de erros na sessão
    if (errors.length > 0) {
      results.push({
        name: 'Erros da Sessão',
        status: 'warning',
        message: `${errors.length} erro(s) total na sessão atual`,
        details: `Primeiro erro: ${errors[0]?.message.substring(0, 100)}...`
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [errors]); // Re-executar quando houver novos erros

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const hasWarnings = diagnostics.some(d => d.status === 'warning');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Diagnóstico de Erro - Produção
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasErrors && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                Foram encontrados erros críticos que podem estar causando a página em branco.
              </AlertDescription>
            </Alert>
          )}

          {hasWarnings && !hasErrors && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">
                Alguns avisos foram encontrados. Verifique as configurações.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mb-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Executar Novamente
            </Button>
            <Button 
              onClick={() => setShowDetails(!showDetails)}
              size="sm"
              variant="outline"
            >
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
            </Button>
            {errors.length > 0 && (
              <Button 
                onClick={() => {
                  clearErrors();
                  runDiagnostics();
                }}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Limpar Erros
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {diagnostics.map((diagnostic, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${getStatusColor(diagnostic.status)}`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.status)}
                  <span className="font-medium">{diagnostic.name}</span>
                </div>
                <p className="text-sm mt-1 text-gray-700">{diagnostic.message}</p>
                {showDetails && diagnostic.details && (
                  <p className="text-xs mt-2 text-gray-600 bg-white/50 p-2 rounded">
                    {diagnostic.details}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Próximos Passos:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              {hasErrors && (
                <>
                  <li>• Configure as variáveis de ambiente do Supabase corretamente</li>
                  <li>• Verifique se o banco de dados está acessível</li>
                  <li>• Execute o script de configuração do banco: npm run setup-db</li>
                </>
              )}
              <li>• Verifique os logs do console do navegador</li>
              <li>• Confirme se todas as dependências estão instaladas</li>
              <li>• Verifique se o build foi realizado corretamente</li>
            </ul>
          </div>

          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Recarregar Página
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDiagnostic;