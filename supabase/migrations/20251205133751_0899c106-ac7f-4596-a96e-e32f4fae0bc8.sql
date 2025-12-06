-- Create orders table for website orders
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id text NOT NULL UNIQUE,
  order_type text NOT NULL DEFAULT 'website',
  site_type text NOT NULL,
  site_type_other text,
  site_name text NOT NULL,
  logo_urls text[],
  primary_color text,
  secondary_color text,
  other_colors text[],
  specific_instructions text,
  description text NOT NULL,
  budget numeric,
  budget_text text,
  full_name text NOT NULL,
  email text NOT NULL,
  discord_username text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all orders"
ON public.orders
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster order_id lookups
CREATE INDEX idx_orders_order_id ON public.orders(order_id);
CREATE INDEX idx_orders_status ON public.orders(status);