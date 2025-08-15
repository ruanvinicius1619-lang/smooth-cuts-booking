import React, { useState } from 'react';
import { GEMINI_CONFIG } from '../config/gemini';
import { useGeminiAI } from '../hooks/useGeminiAI';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface GeminiStatusProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const GeminiStatus: React.FC<GeminiStatusProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const { generateResponse, isLoading } = useGeminiAI();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const isConfigured = Boolean(GEMINI_CONFIG.API_KEY);

  const testGeminiIntegration = async () => {
    setTestResult(null);
    setTestError(null);
    
    try {
      const response = await generateResponse(
        'Olá, você pode me ajudar com informações sobre cortes de cabelo?',
        {
          services: [
            { id: '1', name: 'Corte Clássico', description: 'Corte tradicional', price: 25, duration: 30 },
            { id: '2', name: 'Barba Completa', description: 'Barba e bigode', price: 20, duration: 25 }
          ]
        }
      );
      
      if (response.error) {
        setTestError(response.error);
      } else {
        setTestResult(response.text);
      }
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status da Integração Gemini AI
            {isConfigured ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configurado
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Não Configurado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Verificação da integração com a API do Google Gemini
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Key:</strong> {isConfigured ? '✅ Configurada' : '❌ Não configurada'}
            </div>
            <div>
              <strong>Modelo:</strong> {GEMINI_CONFIG.MODEL}
            </div>
            <div>
              <strong>Temperature:</strong> {GEMINI_CONFIG.GENERATION_CONFIG.temperature}
            </div>
            <div>
              <strong>Max Tokens:</strong> {GEMINI_CONFIG.GENERATION_CONFIG.maxOutputTokens}
            </div>
          </div>

          {!isConfigured && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Como configurar:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Acesse: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li>2. Crie uma API key</li>
                <li>3. Adicione no arquivo .env: <code className="bg-yellow-100 px-1 rounded">VITE_GEMINI_API_KEY=sua_api_key</code></li>
                <li>4. Reinicie o servidor de desenvolvimento</li>
              </ol>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={testGeminiIntegration} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Testar Integração
            </Button>
            
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>

          {testResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Teste bem-sucedido:</h4>
              <p className="text-sm text-green-700">{testResult}</p>
            </div>
          )}

          {testError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">❌ Erro no teste:</h4>
              <p className="text-sm text-red-700">{testError}</p>
              <p className="text-xs text-red-600 mt-2">
                {isConfigured ? 'Verifique se a API key está válida.' : 'Configure a API key primeiro.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};