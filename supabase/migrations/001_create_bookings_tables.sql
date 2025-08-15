-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create barbers table
CREATE TABLE IF NOT EXISTS public.barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(barber_id, booking_date, booking_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_barber_date ON public.bookings(barber_id, booking_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for services (public read access)
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Services are manageable by authenticated users" ON public.services
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for barbers (public read access)
CREATE POLICY "Barbers are viewable by everyone" ON public.barbers
  FOR SELECT USING (true);

CREATE POLICY "Barbers are manageable by authenticated users" ON public.barbers
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for bookings (users can only see their own bookings)
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON public.bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default services
INSERT INTO public.services (name, description, price, duration_minutes) VALUES
  ('Corte + Pigmentação', 'Corte de cabelo com pigmentação', 45.00, 50),
  ('Corte + Barba', 'Combo completo de corte e barba', 50.00, 40),
  ('Corte + Sobrancelhas', 'Corte de cabelo com design de sobrancelhas', 60.00, 50),
  ('Corte + Barba + Sobrancelhas', 'Combo completo com todos os serviços', 60.00, 60),
  ('Corte na Tesoura', 'Corte tradicional feito na tesoura', 45.00, 35),
  ('Corte Degradê', 'Corte moderno com degradê', 40.00, 30),
  ('Corte Navalhado', 'Corte com acabamento na navalha', 40.00, 30),
  ('Barba', 'Aparar e modelar a barba', 25.00, 20),
  ('Contorno Pezinho', 'Contorno e acabamento do pezinho', 20.00, 15),
  ('Corte + Selagem', 'Corte com tratamento de selagem', 120.00, 90)
ON CONFLICT DO NOTHING;

-- Insert default barbers
INSERT INTO public.barbers (name, specialty) VALUES
  ('Mateus Pereira', 'Cortes clássicos'),
  ('João Santos', 'Barba e bigode'),
  ('Pedro Costa', 'Cortes modernos')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();