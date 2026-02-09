-- Migration to remove UNIQUE constraint from weight_logs and measurements

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- Weight Logs
ALTER TABLE weight_logs RENAME TO weight_logs_old;
CREATE TABLE weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO weight_logs SELECT * FROM weight_logs_old;
DROP TABLE weight_logs_old;

-- Measurements
ALTER TABLE measurements RENAME TO measurements_old;
CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO measurements SELECT * FROM measurements_old;
DROP TABLE measurements_old;

COMMIT;
PRAGMA foreign_keys=on;
