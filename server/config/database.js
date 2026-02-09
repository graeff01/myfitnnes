const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/myfit.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Initialize database
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Database connected successfully');

        try {
            // 1. Run migrations first to ensure structure is ready (user_id columns added)
            await runMigrations();

            // 2. Then ensure full schema (views, indexes, etc)
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error enforcing schema:', err.message);
                } else {
                    console.log('✅ Database schema enforced (Views/Indexes ready)');
                }
            });
        } catch (err) {
            console.error('Critical failure during database initialization:', err);
        }
    }
});

async function runMigrations() {
    console.log('Running migrations check...');

    // 1. Ensure users table exists first
    try {
        await runAsync(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('✅ Users table ready.');
    } catch (err) {
        console.error('Failed to create users table:', err);
        return; // Can't proceed without users table
    }

    // 2. Ensure at least one user exists for DEFAULT 1
    try {
        const admin = await getAsync('SELECT id FROM users WHERE id = 1');
        if (!admin) {
            console.log('Seeding default user...');
            // Placeholder user with random password (they can register/login normally later)
            await runAsync(`INSERT OR IGNORE INTO users (id, username, password_hash) VALUES (1, 'default_user', 'placeholder')`);
        }
    } catch (err) {
        console.error('Failed to seed default user:', err);
    }

    const tables = [
        'workouts',
        'weight_logs',
        'measurements',
        'hydration_logs',
        'evolution_photos'
    ];

    for (const table of tables) {
        try {
            const columns = await allAsync(`PRAGMA table_info(${table})`);
            const hasUserId = columns.some(col => col.name === 'user_id');
            if (!hasUserId) {
                console.log(`Adding user_id to ${table}...`);
                // Use a sub-transaction or just execute
                await runAsync(`ALTER TABLE ${table} ADD COLUMN user_id INTEGER DEFAULT 1`);
                console.log(`✅ Table ${table} migrated.`);
            }
        } catch (err) {
            console.error(`Failed to migrate ${table}:`, err.message);
        }
    }

    // Settings migration
    try {
        const columns = await allAsync('PRAGMA table_info(settings)');
        const hasUserId = columns.some(col => col.name === 'user_id');
        if (columns.length > 0 && !hasUserId) {
            console.log('Migrating settings table...');
            await runAsync('ALTER TABLE settings RENAME TO settings_old');
            await runAsync(`CREATE TABLE settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                weekly_goal INTEGER DEFAULT 4,
                weight_unit TEXT DEFAULT 'kg',
                measurement_unit TEXT DEFAULT 'cm',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);
            await runAsync('INSERT INTO settings (user_id, weekly_goal) SELECT 1, weekly_goal FROM settings_old WHERE id = 1');
            await runAsync('DROP TABLE settings_old');
            console.log('✅ Settings table migrated.');
        } else if (columns.length === 0) {
            // Table doesn't exist yet, schema.sql will handle it
            console.log('Settings table will be handled by schema.sql');
        }
    } catch (err) {
        console.error('Failed to migrate settings:', err.message);
    }
}

// Helper to promisify database operations
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = { db, runAsync, getAsync, allAsync };
