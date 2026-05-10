const fs = require('fs');
const db = require('./db');

async function migrate() {
    try {
        const sql = fs.readFileSync('./migration_payment.sql', 'utf8');
        await db.query(sql);
        console.log("Migration successful");
    } catch (e) {
        console.error("Migration failed", e);
    } finally {
        process.exit();
    }
}
migrate();
