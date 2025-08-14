import { useState, useEffect } from 'react';
import { getServices, getBarbers, getBarbershopSettings } from '@/config/admin';

// Hook personalizado para sincronizar dados do sistema de administração
export const useAdminData = () => {
  const [services, setServices] = useState(getServices());
  const [barbers, setBarbers] = useState(getBarbers());
  const [settings, setSettings] = useState(getBarbershopSettings());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para forçar atualização dos dados
  const refreshData = () => {
    setServices(getServices());
    setBarbers(getBarbers());
    setSettings(getBarbershopSettings());
    setLastUpdate(Date.now());
  };

  // Listener para mudanças no localStorage (sincronização entre abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'barbershop_services' || 
          e.key === 'barbershop_barbers' || 
          e.key === 'barbershop_settings') {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Polling para verificar mudanças (fallback para mesma aba)
  useEffect(() => {
    const interval = setInterval(() => {
      // Verifica se houve mudanças comparando timestamps
      const currentServices = getServices();
      const currentBarbers = getBarbers();
      const currentSettings = getBarbershopSettings();
      
      // Comparação simples por JSON (pode ser otimizada)
      if (JSON.stringify(currentServices) !== JSON.stringify(services) ||
          JSON.stringify(currentBarbers) !== JSON.stringify(barbers) ||
          JSON.stringify(currentSettings) !== JSON.stringify(settings)) {
        refreshData();
      }
    }, 2000); // Verifica a cada 2 segundos

    return () => clearInterval(interval);
  }, [services, barbers, settings]);

  return {
    services,
    barbers,
    settings,
    refreshData,
    lastUpdate
  };
};

export default useAdminData;