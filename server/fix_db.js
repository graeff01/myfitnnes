const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db/myfit.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting multi-user migration...');

db.serialize(() => {
    // 1. Ensure users table exists
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    const tables = [
        'workouts',
        'weight_logs',
        'measurements',
        'hydration_logs',
        'evolution_photos'
    ];

    tables.forEach(table => {
        db.all(`PRAGMA table_info(${table})`, (err, columns) => {
            if (err) {
                console.error(`Error checking table ${table}:`, err);
                return;
            }
            const hasUserId = columns.some(col => col.name === 'user_id');
            if (!hasUserId) {
                console.log(`Adding user_id to ${table}...`);
                db.run(`ALTER TABLE ${table} ADD COLUMN user_id INTEGER DEFAULT 1`, (err) => {
                    if (err) console.error(`Failed to add user_id to ${table}:`, err);
                    else console.log(`Successfully added user_id to ${table}`);
                });
            } else {
                console.log(`${table} already has user_id.`);
            }
        });
    });

    // Special handling for hydration_logs UNIQUE constraint
    db.run(`DROP INDEX IF EXISTS idx_hydration_date`);

    // Check if hydration_logs has the constraint (SQLite doesn't support ALTER TABLE DROP CONSTRAINT)
    // We'll just ensure it's correct in the schema for new databases, 
    // for existing ones we might need a full recreation but let's try to just fix columns first.
    // Actually, migration of settings is more critical.

    // 2. Migrate settings table
    db.all(`PRAGMA table_info(settings)`, (err, columns) => {
        if (err) return;
        const hasUserId = columns.some(col => col.name === 'user_id');
        if (!hasUserId) {
            console.log('Migrating settings table to multi-user...');
            db.serialize(() => {
                db.run(`ALTER TABLE settings RENAME TO settings_old`);
                db.run(`CREATE TABLE settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE,
                    weekly_goal INTEGER DEFAULT 4,
                    weight_unit TEXT DEFAULT 'kg',
                    measurement_unit TEXT DEFAULT 'cm',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`);
                // If there's an existing setting, assign it to user 1 if user 1 exists
                db.run(`INSERT INTO settings (user_id, weekly_goal, weight_unit, measurement_unit)
                        SELECT 1, weekly_goal, weight_unit, measurement_unit FROM settings_old WHERE id = 1`);
                db.run(`DROP TABLE settings_old`);
                console.log('Settings table migrated.');
            });
        }
    });

    console.log('Migration script finished execution (async tasks might still be running).');
});
