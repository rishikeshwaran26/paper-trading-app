const db = require('./config/database');

async function main() {
  await db.connect();

  const result = db.exec(`
    SELECT id, symbol, name
    FROM stocks
    WHERE symbol='IDEA';
  `);

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);