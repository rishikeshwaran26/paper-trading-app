'use strict';

// Test data seeder — creates clean database state for each test.
// Uses an in-memory SQLite database to isolate tests.
// TODO: Implement test DB setup and teardown

const seedTestDatabase = () => {
  // TODO: Create in-memory database, run schema, insert test data
  // 1. Create user
  // 2. Create portfolio with initial_capital = 100000
  // 3. Insert stock master (TCS, RELIANCE, INFY, etc.)
  // 4. Return db instance
};

const clearTestDatabase = () => {
  // TODO: Drop all tables or close connection
};

module.exports = { seedTestDatabase, clearTestDatabase };
