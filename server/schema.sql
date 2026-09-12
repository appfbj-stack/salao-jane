CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2),
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  services JSONB NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  total_duration INT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  end_time_slot TEXT,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'studio_admin'
);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(client_phone);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  appointment_id TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  cost_amount NUMERIC(10,2),
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  client_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  total_visits INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
