-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  muscle_groups TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Weight tracking table
CREATE TABLE IF NOT EXISTS weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Body measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  chest REAL,
  waist REAL,
  hips REAL,
  left_arm REAL,
  right_arm REAL,
  left_thigh REAL,
  right_thigh REAL,
  left_calf REAL,
  right_calf REAL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Hydration logs table (Updated to ML)
CREATE TABLE IF NOT EXISTS hydration_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  volume_ml INTEGER DEFAULT 0,
  goal_ml INTEGER DEFAULT 2500,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  weekly_goal INTEGER DEFAULT 4,
  weight_unit TEXT DEFAULT 'kg',
  measurement_unit TEXT DEFAULT 'cm',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Evolution photos table
CREATE TABLE IF NOT EXISTS evolution_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  image_data TEXT NOT NULL, -- Base64
  caption TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (id, weekly_goal, weight_unit, measurement_unit) 
VALUES (1, 4, 'kg', 'cm');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(date);
CREATE INDEX IF NOT EXISTS idx_hydration_date ON hydration_logs(date);

-- Monthly stats view
CREATE VIEW IF NOT EXISTS monthly_stats AS
SELECT 
  strftime('%Y-%m', date) as month,
  COUNT(*) as total_workouts,
  COUNT(DISTINCT date) as training_days,
  muscle_groups
FROM workouts
GROUP BY month;