-- BistroCardapio - Schema D1
-- Criar no dashboard: Storage & Databases > D1 > Create > bistro-db
-- Depois rodar esse SQL no Console do D1 ou com: npx wrangler d1 execute bistro-db --file schema.sql

CREATE TABLE IF NOT EXISTS restaurant (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  message TEXT DEFAULT 'Obrigado pela preferência! Volte sempre.'
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'Geral',
  img TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 10,
  min_stock INTEGER DEFAULT 5
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  table_no TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  code TEXT DEFAULT '',
  items_json TEXT NOT NULL,
  subtotal REAL DEFAULT 0,
  service REAL DEFAULT 0,
  total REAL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  items_json TEXT NOT NULL,
  total REAL NOT NULL,
  payment TEXT NOT NULL,
  paid REAL DEFAULT 0,
  change_amount REAL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS passwords (
  role TEXT PRIMARY KEY,
  password TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO restaurant (id, name, whatsapp, cover, message) VALUES (1, '', '', '', 'Obrigado pela preferência! Volte sempre.');
INSERT OR IGNORE INTO passwords (role, password) VALUES ('admin', ''), ('caixa', ''), ('cozinha', ''), ('entrega', ''), ('estoque', '');
