const db = require('./config/database');
const path = require('path');

async function main() {
  await db.connect();

  db.exec(`
    INSERT INTO stocks (
      symbol,
      name,
      isin,
      exchange,
      sector,
      industry,
      face_value
    )
    VALUES (
      'IDEA',
      'Vodafone Idea Limited',
      'INE669E01016',
      'NSE',
      'Telecom',
      'Wireless Telecom',
      10
    );
  `);

  db.saveToFile(path.join(__dirname, '../data/trading.db'));

  console.log('IDEA added');
}

main().catch(console.error);