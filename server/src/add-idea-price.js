const db = require('./config/database');
const path = require('path');

async function main() {
  await db.connect();

  db.exec(`
    INSERT INTO price_history (
      stock_id,
      date,
      open,
      high,
      low,
      close,
      volume
    )
    VALUES (
      11,
      date('now'),
      14.14,
      14.85,
      14.03,
      14.14,
      957062662
    );
  `);

  db.saveToFile(path.join(__dirname, '../data/trading.db'));

  console.log('IDEA price added');
}

main().catch(console.error);