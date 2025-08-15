import { useState, useEffect } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
}

export const useErrorDetection = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [hasUnhandledErrors, setHasUnhandledErrors] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now()
      };
      
      setErrors(prev => [...prev, errorInfo]);
      setHasUnhandledErrors(true);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now()
      };
      
      setErrors(prev => [...prev, errorInfo]);
      setHasUnhandledErrors(true);
    };

    // Capturar erros do console de forma assíncrona para evitar setState durante renderização
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      originalError.apply(console, args);
      
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        const errorInfo: ErrorInfo = {
          message: args.join(' '),
          timestamp: Date.now()
        };
        
        setErrors(prev => [...prev, errorInfo]);
      }, 0);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        const errorInfo: ErrorInfo = {
          message: `Warning: ${args.join(' ')}`,
          timestamp: Date.now()
        };
        
        setErrors(prev => [...prev, errorInfo]);
      }, 0);
    };

    // Adicionar listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearErrors = () => {
    setErrors([]);
    setHasUnhandledErrors(false);
  };

  const getRecentErrors = (minutes: number = 5) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return errors.filter(error => error.timestamp > cutoff);
  };

  return {
    errors,
    hasUnhandledErrors,
    clearErrors,
    getRecentErrors,
    errorCount: errors.length
  };
};