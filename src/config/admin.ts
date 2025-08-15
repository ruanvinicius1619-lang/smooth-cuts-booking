// Admin configuration
export const ADMIN_CONFIG = {
  // Lista de emails de administradores
  adminEmails: [
    'admin@mateusbarber.com',
    'mateus@mateusbarber.com',
    'gerente@mateusbarber.com',
    // Adicione outros emails de administradores aqui
  ],
  
  // Senha padrão para administradores
  defaultPassword: '1233',
  
  // Configurações da barbearia que podem ser editadas
  barbershopSettings: {
    name: 'Mateus BarberShop',
    description: 'A melhor barbearia da cidade',
    address: 'Rua São Gonçalo, nº 36 – Bairro Santos Dumont',
    phone: '(11) 99999-9999',
    email: 'contato@mateusbarber.com',
    workingHours: {
      monday: '09:00 - 17:00',
      tuesday: '09:00 - 17:00',
      wednesday: '09:00 - 17:00',
      thursday: '09:00 - 17:00',
      friday: '09:00 - 17:00',
      saturday: '09:00 - 17:00',
      sunday: 'Fechado'
    },
    socialMedia: {
      instagram: '@mateusbarber',
      facebook: 'Mateus BarberShop',
      whatsapp: '5511999999999'
    }
  }
};

// Função para verificar se um usuário é administrador
export const isAdmin = (userEmail: string | undefined): boolean => {
  if (!userEmail) return false;
  return ADMIN_CONFIG.adminEmails.includes(userEmail.toLowerCase());
};

// Função para obter configurações da barbearia do localStorage ou usar padrão
export const getBarbershopSettings = () => {
  const stored = localStorage.getItem('barbershopSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return ADMIN_CONFIG.barbershopSettings;
    }
  }
  return ADMIN_CONFIG.barbershopSettings;
};

// Função para salvar configurações da barbearia
export const saveBarbershopSettings = (settings: any) => {
  localStorage.setItem('barbershopSettings', JSON.stringify(settings));
  // Disparar evento customizado para notificar outros componentes
  window.dispatchEvent(new CustomEvent('barbershopSettingsUpdated', { detail: settings }));
};

// Função para obter serviços do localStorage ou usar padrão
export const getServices = () => {
  const stored = localStorage.getItem('adminServices');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultServices();
    }
  }
  return getDefaultServices();
};

// Função para salvar serviços
export const saveServices = (services: any[]) => {
  localStorage.setItem('adminServices', JSON.stringify(services));
  // Disparar evento customizado para notificar outros componentes
  window.dispatchEvent(new CustomEvent('servicesUpdated', { detail: services }));
};

// Função para obter barbeiros do localStorage ou usar padrão
export const getBarbers = () => {
  const stored = localStorage.getItem('adminBarbers');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultBarbers();
    }
  }
  return getDefaultBarbers();
};

// Função para salvar barbeiros
export const saveBarbers = (barbers: any[]) => {
  localStorage.setItem('adminBarbers', JSON.stringify(barbers));
  // Disparar evento customizado para notificar outros componentes
  window.dispatchEvent(new CustomEvent('barbersUpdated', { detail: barbers }));
};

// Serviços padrão
const getDefaultServices = () => [
  { id: "corte-pigmentacao", name: "Corte + Pigmentação", price: 45, duration: "50min", description: "Corte de cabelo com pigmentação" },
  { id: "corte-barba", name: "Corte + Barba", price: 50, duration: "40min", description: "Combo completo de corte e barba" },
  { id: "corte-sobrancelhas", name: "Corte + Sobrancelhas", price: 60, duration: "50min", description: "Corte de cabelo com design de sobrancelhas" },
  { id: "corte-barba-sobrancelhas", name: "Corte + Barba + Sobrancelhas", price: 60, duration: "60min", description: "Combo completo com todos os serviços" },
  { id: "corte-tesoura", name: "Corte na Tesoura", price: 45, duration: "35min", description: "Corte tradicional feito na tesoura" },
  { id: "corte-degrade", name: "Corte Degradê", price: 40, duration: "30min", description: "Corte moderno com degradê" },
  { id: "corte-navalhado", name: "Corte Navalhado", price: 40, duration: "30min", description: "Corte com acabamento na navalha" },
  { id: "barba", name: "Barba", price: 25, duration: "20min", description: "Aparar e modelar a barba" },
  { id: "contorno-pezinho", name: "Contorno Pezinho", price: 20, duration: "15min", description: "Contorno e acabamento do pezinho" },
  { id: "corte-selagem", name: "Corte + Selagem", price: 120, duration: "90min", description: "Corte com tratamento de selagem" }
];

// Barbeiros padrão
const getDefaultBarbers = () => [
  { id: "carlos", name: "Mateus Pereira", specialty: "Cortes clássicos", email: "carlos@mateusbarber.com", phone: "(11) 98888-8888" },
  { id: "joao", name: "João Santos", specialty: "Barba e bigode", email: "joao@mateusbarber.com", phone: "(11) 97777-7777" },
  { id: "pedro", name: "Pedro Costa", specialty: "Cortes modernos", email: "pedro@mateusbarber.com", phone: "(11) 96666-6666" }
];