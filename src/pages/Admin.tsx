import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Users, 
  Scissors, 
  Store,
  Clock,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle
} from "lucide-react";
import Header from "@/components/Header";
import { 
  isAdmin, 
  getBarbershopSettings, 
  saveBarbershopSettings,
  getServices,
  saveServices,
  getBarbers,
  saveBarbers
} from "@/config/admin";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface Barber {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
}

interface BarbershopSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  workingHours: {
    [key: string]: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
}

const Admin = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershopSettings, setBarbershopSettings] = useState<BarbershopSettings | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isBarberDialogOpen, setIsBarberDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar autenticação e permissões
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        
        if (!currentUser) {
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar esta página.",
            variant: "destructive"
          });
          navigate("/auth");
          return;
        }
        
        if (!isAdmin(currentUser.email)) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar o painel administrativo.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        setUser(currentUser);
        loadData();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Carregar dados
  const loadData = () => {
    setServices(getServices());
    setBarbers(getBarbers());
    setBarbershopSettings(getBarbershopSettings());
  };

  // Gerenciamento de Serviços
  const handleSaveService = (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    const currentServices = [...services];
    
    if (serviceData.id) {
      // Editar serviço existente
      const index = currentServices.findIndex(s => s.id === serviceData.id);
      if (index !== -1) {
        currentServices[index] = serviceData as Service;
      }
    } else {
      // Adicionar novo serviço
      const newService: Service = {
        ...serviceData,
        id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } as Service;
      currentServices.push(newService);
    }
    
    setServices(currentServices);
    saveServices(currentServices);
    setEditingService(null);
    setIsServiceDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Serviço salvo com sucesso!"
    });
  };

  const handleDeleteService = (serviceId: string) => {
    const updatedServices = services.filter(s => s.id !== serviceId);
    setServices(updatedServices);
    saveServices(updatedServices);
    
    toast({
      title: "Sucesso",
      description: "Serviço removido com sucesso!"
    });
  };

  // Gerenciamento de Barbeiros
  const handleSaveBarber = (barberData: Omit<Barber, 'id'> & { id?: string }) => {
    const currentBarbers = [...barbers];
    
    if (barberData.id) {
      // Editar barbeiro existente
      const index = currentBarbers.findIndex(b => b.id === barberData.id);
      if (index !== -1) {
        currentBarbers[index] = barberData as Barber;
      }
    } else {
      // Adicionar novo barbeiro
      const newBarber: Barber = {
        ...barberData,
        id: `barber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } as Barber;
      currentBarbers.push(newBarber);
    }
    
    setBarbers(currentBarbers);
    saveBarbers(currentBarbers);
    setEditingBarber(null);
    setIsBarberDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Barbeiro salvo com sucesso!"
    });
  };

  const handleDeleteBarber = (barberId: string) => {
    const updatedBarbers = barbers.filter(b => b.id !== barberId);
    setBarbers(updatedBarbers);
    saveBarbers(updatedBarbers);
    
    toast({
      title: "Sucesso",
      description: "Barbeiro removido com sucesso!"
    });
  };

  // Gerenciamento de Configurações
  const handleSaveSettings = (settings: BarbershopSettings) => {
    setBarbershopSettings(settings);
    saveBarbershopSettings(settings);
    
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie serviços, barbeiros e configurações da barbearia
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Serviços
              </TabsTrigger>
              <TabsTrigger value="barbers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Barbeiros
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            {/* Aba de Serviços */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Gerenciar Serviços</h2>
                <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingService(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                      </DialogTitle>
                    </DialogHeader>
                    <ServiceForm 
                      service={editingService} 
                      onSave={handleSaveService}
                      onCancel={() => {
                        setEditingService(null);
                        setIsServiceDialogOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingService(service);
                              setIsServiceDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </Badge>
                        <span className="text-2xl font-bold text-accent">
                          R$ {service.price}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Aba de Barbeiros */}
            <TabsContent value="barbers" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Gerenciar Barbeiros</h2>
                <Dialog open={isBarberDialogOpen} onOpenChange={setIsBarberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingBarber(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Barbeiro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingBarber ? 'Editar Barbeiro' : 'Adicionar Novo Barbeiro'}
                      </DialogTitle>
                    </DialogHeader>
                    <BarberForm 
                      barber={editingBarber} 
                      onSave={handleSaveBarber}
                      onCancel={() => {
                        setEditingBarber(null);
                        setIsBarberDialogOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.map((barber) => (
                  <Card key={barber.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{barber.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBarber(barber);
                              setIsBarberDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBarber(barber.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{barber.specialty}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4" />
                          {barber.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          {barber.phone}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Aba de Configurações */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Configurações da Barbearia</h2>
              {barbershopSettings && (
                <SettingsForm 
                  settings={barbershopSettings} 
                  onSave={handleSaveSettings}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Componente de formulário para serviços
const ServiceForm = ({ 
  service, 
  onSave, 
  onCancel 
}: { 
  service: Service | null; 
  onSave: (service: Omit<Service, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    price: service?.price || 0,
    duration: service?.duration || '',
    description: service?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(service?.id && { id: service.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Serviço</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="duration">Duração</Label>
          <Input
            id="duration"
            placeholder="ex: 45min"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </form>
  );
};

// Componente de formulário para barbeiros
const BarberForm = ({ 
  barber, 
  onSave, 
  onCancel 
}: { 
  barber: Barber | null; 
  onSave: (barber: Omit<Barber, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: barber?.name || '',
    specialty: barber?.specialty || '',
    email: barber?.email || '',
    phone: barber?.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(barber?.id && { id: barber.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Barbeiro</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="specialty">Especialidade</Label>
        <Input
          id="specialty"
          value={formData.specialty}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </form>
  );
};

// Componente de formulário para configurações
const SettingsForm = ({ 
  settings, 
  onSave 
}: { 
  settings: BarbershopSettings; 
  onSave: (settings: BarbershopSettings) => void;
}) => {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleWorkingHoursChange = (day: string, value: string) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: value
      }
    });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialMedia: {
        ...formData.socialMedia,
        [platform]: value
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Barbearia</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <Label className="w-24 capitalize">
                {day === 'monday' && 'Segunda'}
                {day === 'tuesday' && 'Terça'}
                {day === 'wednesday' && 'Quarta'}
                {day === 'thursday' && 'Quinta'}
                {day === 'friday' && 'Sexta'}
                {day === 'saturday' && 'Sábado'}
                {day === 'sunday' && 'Domingo'}
              </Label>
              <Input
                value={hours}
                onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                placeholder="ex: 09:00 - 18:00 ou Fechado"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Redes Sociais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={formData.socialMedia.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              placeholder="@usuario"
            />
          </div>
          
          <div>
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={formData.socialMedia.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              placeholder="Nome da página"
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              value={formData.socialMedia.whatsapp}
              onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
              placeholder="5511999999999"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
};

export default Admin;