const db = require('./config/database');

async function main() {
  await db.connect();

  const result = db.exec(`
    SELECT *
    FROM price_history
    LIMIT 5;
  `);

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);