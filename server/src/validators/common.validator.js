'use strict';

// Shared validation patterns used across multiple validators.
// In production, these would use Joi schemas or Zod objects.

const patterns = {
  symbol: /^[A-Z]{2,20}$/,
  tradeType: /^(BUY|SELL)$/,
  isin: /^[A-Z]{2}[0-9A-Z]{10}$/,
  date: /^\d{4}-\d{2}-\d{2}$/
};

const rules = {
  symbol: { type: 'string', pattern: '^[A-Z]{2,20}$', required: true },
  quantity: { type: 'integer', minimum: 1, required: true },
  price: { type: 'number', minimum: 0.01, required: true },
  tradeDate: { type: 'string', pattern: 'date', required: false },
  notes: { type: 'string', required: false, maxLength: 1000 }
};

module.exports = { patterns, rules };
