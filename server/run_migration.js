const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db/myfit.db');
const migrationPath = path.join(__dirname, 'config/migration_cumulative_history.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to database.');

    const migration = fs.readFileSync(migrationPath, 'utf8');
    db.exec(migration, (err) => {
        if (err) {
            console.error('Migration failed:', err);
            db.close();
            process.exit(1);
        }
        console.log('Migration successful!');
        db.close();
    });
});
