import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, Settings, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

interface UserProfileManagerProps {
  currentUser?: SupabaseUser | null;
  isAdmin?: boolean;
}

// Check if user is admin (specific emails)
const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  const adminEmails = ['admin@mateusbarber.com', 'mateus@mateusbarber.com', 'gerente@mateusbarber.com'];
  return adminEmails.includes(email);
};

const USER_ROLES = [
  { value: 'Cliente', label: 'Cliente', description: 'Usuário padrão que pode fazer agendamentos' },
  { value: 'Barbeiro', label: 'Barbeiro', description: 'Profissional que atende clientes' },
  { value: 'Admin', label: 'Administrador', description: 'Acesso completo ao sistema' },
  { value: 'Gerente', label: 'Gerente', description: 'Gerencia barbeiros e agendamentos' }
];

export const UserProfileManager: React.FC<UserProfileManagerProps> = ({ 
  currentUser, 
  isAdmin = false 
}) => {
  const isCurrentUserAdmin = isAdminUser(currentUser?.email);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar perfis:', error);
        toast({
          title: "Erro ao carregar perfis",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os perfis de usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (profileId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: newRole })
        .eq('id', profileId);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Perfil atualizado",
        description: `Perfil alterado para ${newRole} com sucesso`,
        variant: "default"
      });

      // Recarregar perfis
      await loadProfiles();
      setEditingProfile(null);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || profile.user_role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Gerente': return 'secondary';
      case 'Barbeiro': return 'default';
      case 'Cliente': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleStats = () => {
    const stats = profiles.reduce((acc, profile) => {
      const role = profile.user_role || 'Não definido';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Carregando Perfis...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas dos Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(getRoleStats()).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{role}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Badge variant={getRoleBadgeVariant(role)}>
                  {role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Perfis de Usuário
          </CardTitle>
          <CardDescription>
            {isCurrentUserAdmin ? 'Gerencie os perfis e permissões dos usuários' : 'Visualize os perfis de usuário'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="role-filter">Filtrar por perfil</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os perfis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os perfis</SelectItem>
                  {USER_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadProfiles} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de Perfis */}
          <div className="space-y-4">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum perfil encontrado</p>
              </div>
            ) : (
              filteredProfiles.map(profile => (
                <Card key={profile.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{profile.full_name || 'Nome não informado'}</h3>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                        <Badge variant={getRoleBadgeVariant(profile.user_role)}>
                          {profile.user_role || 'Não definido'}
                        </Badge>
                        {profile.id === currentUser?.id && (
                          <Badge variant="outline">Você</Badge>
                        )}
                      </div>
                    </div>
                    
                    {isCurrentUserAdmin && profile.id !== currentUser?.id && (
                      <div className="flex items-center gap-2">
                        {editingProfile === profile.id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={profile.user_role}
                              onValueChange={(newRole) => updateUserRole(profile.id, newRole)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {USER_ROLES.map(role => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProfile(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProfile(profile.id)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileManager;