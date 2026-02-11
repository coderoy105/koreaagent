-- Reviews table for verified buyers
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  depositor_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT DEFAULT '토스뱅크',
  account_number TEXT DEFAULT '1908-6747-9631',
  account_holder TEXT DEFAULT '서영조',
  price INTEGER DEFAULT 13000,
  original_price INTEGER DEFAULT 29000,
  book_cover_url TEXT DEFAULT '',
  ebook_download_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit counter table
CREATE TABLE IF NOT EXISTS visit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  page TEXT DEFAULT '/'
);

-- Insert default settings if not exists
INSERT INTO site_settings (bank_name, account_number, account_holder, price, original_price)
SELECT '토스뱅크', '1908-6747-9631', '서영조', 13000, 29000
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Add instagram_id column to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS instagram_id TEXT;

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reviews" ON reviews FOR DELETE USING (true);

-- RLS Policies for site_settings
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON site_settings FOR UPDATE USING (true);

-- RLS Policies for visit_logs
CREATE POLICY "Anyone can read visits" ON visit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert visits" ON visit_logs FOR INSERT WITH CHECK (true);
