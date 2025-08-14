import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DatabaseInitializer from "@/components/DatabaseInitializer";
import IdleLogoutProvider from "@/components/IdleLogoutProvider";
import DiagnosticFloatingButton from "@/components/DiagnosticFloatingButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DatabaseInitializer>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <IdleLogoutProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <DiagnosticFloatingButton />
            <WhatsAppButton phoneNumber="5571993163034" />
          </IdleLogoutProvider>
        </BrowserRouter>
      </DatabaseInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
