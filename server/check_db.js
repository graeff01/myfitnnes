const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db/myfit.db');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(workouts)", (err, columns) => {
    if (err) console.error(err);
    else console.log("Workouts columns:", columns.map(c => c.name));
});

db.all("PRAGMA table_info(settings)", (err, columns) => {
    if (err) console.error(err);
    else console.log("Settings columns:", columns.map(c => c.name));
});

db.close();
