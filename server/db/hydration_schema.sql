-- Hydration logs table
CREATE TABLE IF NOT EXISTS hydration_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  glasses INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 8,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for hydration date
CREATE INDEX IF NOT EXISTS idx_hydration_date ON hydration_logs(date);
