import React from 'react';
import { useDatabaseSetup, ensureTablesExist, checkDatabaseConnection } from '@/utils/database-setup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

/**
 * Componente de exemplo mostrando como usar as funções de setup do banco de dados
 * Este arquivo serve como referência e pode ser removido em produção
 */
export const DatabaseSetupExample: React.FC = () => {
  const { isReady, isLoading, error } = useDatabaseSetup();
  const [manualCheckLoading, setManualCheckLoading] = React.useState(false);
  const [manualCheckResult, setManualCheckResult] = React.useState<string | null>(null);

  // Função para testar manualmente a verificação do banco
  const handleManualCheck = async () => {
    setManualCheckLoading(true);
    setManualCheckResult(null);
    
    try {
      console.log('🔍 Iniciando verificação manual...');
      
      // Testa a verificação das tabelas
      const tablesExist = await ensureTablesExist();
      
      if (tablesExist) {
        // Testa a conectividade
        const connectionOk = await checkDatabaseConnection();
        
        if (connectionOk) {
          setManualCheckResult('✅ Banco de dados configurado e conectado com sucesso!');
        } else {
          setManualCheckResult('⚠️ Tabelas existem, mas há problemas de conectividade');
        }
      } else {
        setManualCheckResult('❌ Falha na configuração das tabelas');
      }
      
    } catch (err) {
      console.error('Erro durante verificação manual:', err);
      setManualCheckResult('❌ Erro inesperado durante verificação');
    } finally {
      setManualCheckLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Status do Banco de Dados
          </CardTitle>
          <CardDescription>
            Exemplo de como usar as funções de verificação automática do banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do Hook */}
          <div className="space-y-2">
            <h3 className="font-semibold">Hook useDatabaseSetup():</h3>
            <div className="flex items-center gap-2">
              <Badge variant={isReady ? 'default' : error ? 'destructive' : 'secondary'}>
                {isLoading ? (
                  <><Loader2 className="h-3 w-3 animate-spin mr-1" />Carregando</>
                ) : isReady ? (
                  <><CheckCircle className="h-3 w-3 mr-1" />Pronto</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" />Erro</>
                )}
              </Badge>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </div>

          {/* Verificação Manual */}
          <div className="space-y-2">
            <h3 className="font-semibold">Verificação Manual:</h3>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleManualCheck} 
                disabled={manualCheckLoading}
                size="sm"
              >
                {manualCheckLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Verificando...</>
                ) : (
                  <>Verificar Banco Manualmente</>
                )}
              </Button>
            </div>
            {manualCheckResult && (
              <div className="text-sm p-2 bg-slate-100 rounded border">
                {manualCheckResult}
              </div>
            )}
          </div>

          {/* Informações Técnicas */}
          <div className="space-y-2">
            <h3 className="font-semibold">Informações Técnicas:</h3>
            <div className="text-sm space-y-1 text-slate-600">
              <p><strong>isReady:</strong> {isReady.toString()}</p>
              <p><strong>isLoading:</strong> {isLoading.toString()}</p>
              <p><strong>error:</strong> {error || 'null'}</p>
            </div>
          </div>

          {/* Logs do Console */}
          <div className="space-y-2">
            <h3 className="font-semibold">Logs:</h3>
            <div className="text-sm text-slate-600">
              <p>Abra o DevTools (F12) → Console para ver os logs detalhados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar em Seus Componentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Hook para Componentes React:</h4>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
{`import { useDatabaseSetup } from '@/utils/database-setup';

const MyComponent = () => {
  const { isReady, isLoading, error } = useDatabaseSetup();
  
  if (isLoading) return <div>Configurando banco...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!isReady) return <div>Banco não está pronto</div>;
  
  return <div>Componente carregado!</div>;
};`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Funções Diretas:</h4>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
{`import { ensureTablesExist, checkDatabaseConnection } from '@/utils/database-setup';

// Verificar e criar tabelas
const tablesOk = await ensureTablesExist();

// Testar conectividade
const connectionOk = await checkDatabaseConnection();`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Wrapper de Componente:</h4>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
{`import DatabaseInitializer from '@/components/DatabaseInitializer';

const App = () => (
  <DatabaseInitializer>
    <YourAppContent />
  </DatabaseInitializer>
);`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSetupExample;