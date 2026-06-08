'use strict';

// Validation schema for POST /api/trades/buy
// TODO: Implement with Joi or Zod
//
// Required fields:
//   symbol: string, uppercase, 2-20 chars
//   quantity: integer, > 0
//   price: number, > 0
//
// Optional fields:
//   trade_date: ISO date string (defaults to today)
//   notes: string, max 1000 chars
//   target_price: number, > 0 (creates a target automatically)
//   stop_loss: number, > 0 (creates a stop loss automatically)

const buySchema = {
  // TODO: Define validation schema
  // symbol: Joi.string().uppercase().length(2, 20).required(),
  // quantity: Joi.number().integer().min(1).required(),
  // price: Joi.number().positive().required(),
  // trade_date: Joi.date().iso().optional(),
  // notes: Joi.string().max(1000).optional().allow(''),
  // target_price: Joi.number().positive().optional(),
  // stop_loss: Joi.number().positive().optional()
};

module.exports = buySchema;
