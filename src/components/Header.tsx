import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface HeaderProps {
  onBookingClick?: () => void;
}
const Header = ({
  onBookingClick
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
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
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-barbershop-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground">Mateus Barbershop</span>
              <span className="text-sm text-barbershop-gray font-medium">Mateus Barbershop</span>
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
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button variant="premium" onClick={handleBookingClick}>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Agora
            </Button>
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
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button variant="premium" onClick={handleBookingClick}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Agora
                </Button>
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;