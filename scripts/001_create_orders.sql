-- Create orders table for e-book purchases
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  depositor_name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 9900,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (for API routes)
CREATE POLICY "Service role can do everything" ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_depositor_name ON public.orders(depositor_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
