// Barber configuration
export const BARBER_CONFIG = {
  // Credenciais padrão para barbeiros (email e senha)
  defaultCredentials: {
    email: 'barbeiro@mateusbarber.com',
    password: '123456'
  },
  
  // Lista de barbeiros autorizados (pode ser expandida no futuro)
  authorizedBarbers: [
    {
      id: 'default-barber',
      email: 'barbeiro@mateusbarber.com',
      name: 'Barbeiro Padrão',
      permissions: ['view_appointments']
    },
    {
      id: 'smoothcuts-barber',
      email: 'barbeiro@smoothcuts.com',
      name: 'Barbeiro SmoothCuts',
      permissions: ['view_appointments']
    },
    {
      id: 'joao-barber',
      email: 'joao@mateusbarber.com',
      name: 'João',
      permissions: ['view_appointments']
    },
    {
      id: 'pedro-barber',
      email: 'pedro@mateusbarber.com',
      name: 'Pedro',
      permissions: ['view_appointments']
    }
  ]
};

// Função para verificar se as credenciais do barbeiro são válidas
export const validateBarberCredentials = (email: string, password: string): boolean => {
  const { defaultCredentials } = BARBER_CONFIG;
  return email === defaultCredentials.email && password === defaultCredentials.password;
};

// Função para verificar se um usuário é barbeiro
export const isBarber = (email: string | undefined): boolean => {
  if (!email) return false;
  return BARBER_CONFIG.authorizedBarbers.some(barber => barber.email === email);
};

// Função para obter dados do barbeiro
export const getBarberData = (email: string) => {
  return BARBER_CONFIG.authorizedBarbers.find(barber => barber.email === email);
};

// Função para verificar permissões do barbeiro
export const hasBarberPermission = (email: string, permission: string): boolean => {
  const barber = getBarberData(email);
  return barber ? barber.permissions.includes(permission) : false;
};