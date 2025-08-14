-- Execute este SQL no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/jheywkeofcttgdgquawm/sql

-- 1. Criar tabela services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar tabela barbers
CREATE TABLE IF NOT EXISTS public.barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar tabela bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes (se houver) e criar novas para services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Services are manageable by authenticated users" ON public.services;

CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT USING (true);

CREATE POLICY "Services are manageable by authenticated users" 
ON public.services FOR ALL USING (auth.role() = 'authenticated');

-- 6. Remover políticas existentes (se houver) e criar novas para barbers
DROP POLICY IF EXISTS "Barbers are viewable by everyone" ON public.barbers;
DROP POLICY IF EXISTS "Barbers are manageable by authenticated users" ON public.barbers;

CREATE POLICY "Barbers are viewable by everyone" 
ON public.barbers FOR SELECT USING (true);

CREATE POLICY "Barbers are manageable by authenticated users" 
ON public.barbers FOR ALL USING (auth.role() = 'authenticated');

-- 7. Remover políticas existentes (se houver) e criar novas para bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings" 
ON public.bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" 
ON public.bookings FOR DELETE USING (auth.uid() = user_id);

-- 8. Inserir dados iniciais para services
INSERT INTO public.services (name, description, price, duration) VALUES
('Corte Simples', 'Corte de cabelo tradicional', 25.00, 30),
('Corte + Barba', 'Corte de cabelo + barba completa', 40.00, 45),
('Barba', 'Aparar e modelar barba', 20.00, 20),
('Corte Premium', 'Corte estilizado + finalização', 35.00, 40)
ON CONFLICT (name) DO NOTHING;

-- 9. Inserir dados iniciais para barbers
INSERT INTO public.barbers (name, email, phone) VALUES
('João Silva', 'joao@barbershop.com', '(11) 99999-1111'),
('Pedro Santos', 'pedro@barbershop.com', '(11) 99999-2222'),
('Carlos Oliveira', 'carlos@barbershop.com', '(11) 99999-3333')
ON CONFLICT (email) DO NOTHING;

-- 10. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Remover triggers existentes (se houver) e criar novos
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS update_barbers_updated_at ON public.barbers;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fim do script
-- Após executar, as tabelas estarão criadas e prontas para uso!