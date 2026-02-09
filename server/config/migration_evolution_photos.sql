-- Migration to add evolution_photos table
CREATE TABLE IF NOT EXISTS evolution_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  image_data TEXT NOT NULL, -- Base64 encoded image
  caption TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evolution_photos_date ON evolution_photos(date);
