const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db/myfit.db');
const db = new sqlite3.Database(dbPath);

console.log('--- Table Info ---');
db.all("PRAGMA table_info(weight_logs)", [], (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);

    console.log('\n--- Indexes ---');
    db.all("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='weight_logs'", [], (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);

        console.log('\n--- Records ---');
        db.all("SELECT * FROM weight_logs ORDER BY date DESC", [], (err, rows) => {
            if (err) console.error(err);
            else console.log(rows);
            db.close();
        });
    });
});
