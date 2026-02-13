const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db/myfit.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking all settings rows...');
db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Settings:', rows);
    }

    console.log('Checking all users...');
    db.all('SELECT id, username FROM users', [], (err, users) => {
        if (err) console.error(err);
        else console.log('Users:', users);
        db.close();
    });
});
