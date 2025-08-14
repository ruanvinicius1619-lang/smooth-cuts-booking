import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, Scissors, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
interface HeaderProps {
  onBookingClick?: () => void;
}
const Header = ({
  onBookingClick
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const navItems = [{
    label: "Início",
    href: "/"
  }, {
    label: "Serviços",
    href: "/services"
  }, {
    label: "Sobre",
    href: "/about"
  }, {
    label: "Contato",
    href: "/contact"
  }];
  const handleBookingClick = () => {
    if (onBookingClick) {
      onBookingClick();
    } else {
      navigate("/booking");
    }
  };
  const handleLogout = async () => {
    try {
      // Primeira tentativa: logout normal
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Segunda tentativa: logout apenas local
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        
        if (localError) {
          // Terceira tentativa: limpeza manual
          localStorage.removeItem('sb-jheywkeofcttgdgquawm-auth-token');
          localStorage.removeItem('supabase.auth.token');
          
          // Força atualização do estado
          window.location.reload();
          return;
        }
      }
      
      navigate("/");
    } catch (error) {
      // Fallback final: limpeza manual e reload
      localStorage.clear();
      window.location.href = '/';
    }
  };
  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-barbershop-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground">Mateus BarberShop</span>
              <span className="text-sm text-barbershop-gray font-medium">Mateus BarberShop</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => <button key={item.label} onClick={() => navigate(item.href)} className="text-foreground hover:text-accent transition-smooth font-medium">
                {item.label}
              </button>)}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <span>Meu Perfil</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="premium" onClick={handleBookingClick}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Agora
                </Button>
              </> : <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button variant="premium" onClick={handleBookingClick}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Agora
                </Button>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-elegant">
            <nav className="flex flex-col p-4 space-y-4">
              {navItems.map(item => <button key={item.label} onClick={() => {
            navigate(item.href);
            setIsMenuOpen(false);
          }} className="text-left text-foreground hover:text-accent transition-smooth font-medium py-2">
                  {item.label}
                </button>)}
              <div className="flex flex-col space-y-3 pt-4">
                {user ? <>
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm">
                          {getUserInitials(user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Meu Perfil</span>
                    </div>
                    <Button variant="outline" onClick={() => {
                navigate("/profile");
                setIsMenuOpen(false);
              }}>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </Button>
                    <Button variant="outline" onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                    <Button variant="premium" onClick={handleBookingClick}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Agora
                    </Button>
                  </> : <>
                    <Button variant="outline" onClick={() => navigate("/auth")}>
                      Entrar
                    </Button>
                    <Button variant="premium" onClick={handleBookingClick}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Agora
                    </Button>
                  </>}
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;