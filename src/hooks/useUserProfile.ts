import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log('🔍 Verificando/criando perfil para usuário:', user.email);
      
      // Primeiro, verificar se o perfil já existe
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil existente:', fetchError);
        return null;
      }
      
      if (existingProfile) {
        console.log('✅ Perfil existente encontrado:', existingProfile);
        setProfile(existingProfile);
        return existingProfile;
      }
      
      // Se não existe, criar novo perfil
      console.log('📝 Criando novo perfil para:', user.email);
      
      const newProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError);
        
        // Se o erro for de conflito (perfil já existe), tentar buscar novamente
        if (createError.code === '23505') {
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (retryProfile) {
            console.log('✅ Perfil encontrado após conflito:', retryProfile);
            setProfile(retryProfile);
            return retryProfile;
          }
        }
        
        toast({
          title: "Aviso",
          description: "Não foi possível criar o perfil automaticamente. Alguns dados podem não aparecer corretamente.",
          variant: "destructive"
        });
        return null;
      }
      
      console.log('✅ Perfil criado com sucesso:', createdProfile);
      setProfile(createdProfile);
      return createdProfile;
      
    } catch (error) {
      console.error('❌ Erro geral ao criar/atualizar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user && !loading) {
      setLoading(true);
      createOrUpdateProfile(user).finally(() => {
        setLoading(false);
      });
    } else if (!user) {
      setProfile(null);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return null;
    
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil.",
          variant: "destructive"
        });
        return null;
      }
      
      setProfile(updatedProfile);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
      return updatedProfile;
      
    } catch (error) {
      console.error('Erro geral ao atualizar perfil:', error);
      return null;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    createOrUpdateProfile
  };
};