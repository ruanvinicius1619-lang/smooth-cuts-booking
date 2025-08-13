import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { ArrowLeft, User, Mail, Calendar, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/auth");
          return;
        }

        setUser(session.user);
        setFormData({
          email: session.user.email || "",
          full_name: session.user.user_metadata?.full_name || "",
          phone: session.user.user_metadata?.phone || ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do perfil",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate, toast]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || ""
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="text-center">Carregando...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Meu Perfil
              </h1>
              <p className="text-xl text-muted-foreground">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="text-2xl">
                        {getUserInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <User className="w-5 h-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        placeholder="Digite seu nome completo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        placeholder="Digite seu telefone"
                      />
                    </div>

                    <div>
                      <Label>Membro desde</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Input
                          value={new Date(user.created_at).toLocaleDateString('pt-BR')}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSave}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Salvando..." : "Salvar"}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;