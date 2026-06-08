'use strict';

const app = require('./app');
const database = require('./config/database');

const PORT = process.env.PORT || 3001;

// Initialize database connection
database.connect();

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`[server] Paper trading API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[server] Shutting down...');
  server.close(() => {
    database.close();
    console.log('[server] Database connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    database.close();
    process.exit(0);
  });
});
