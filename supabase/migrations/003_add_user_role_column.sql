-- Add user_role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_role TEXT DEFAULT 'Cliente' NOT NULL;

-- Create index for better performance on user_role queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);

-- Update existing users with specific emails to have 'Cliente' role
UPDATE public.profiles 
SET user_role = 'Cliente' 
WHERE email IN ('egrinaldo19@gmail.com', 'egrinaldo25@outlook.com');

-- Update the handle_new_user function to include user_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'Cliente'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to document the user_role column
COMMENT ON COLUMN public.profiles.user_role IS 'User role/profile type (Cliente, Admin, Barbeiro, etc.)';