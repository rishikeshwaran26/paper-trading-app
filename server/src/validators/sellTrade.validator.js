'use strict';

// Validation schema for POST /api/trades/sell
// TODO: Implement with Joi or Zod
//
// Required fields:
//   symbol: string, uppercase, 2-20 chars
//   quantity: integer, > 0
//   price: number, > 0
//
// Optional fields:
//   trade_date: ISO date string
//   notes: string, max 1000 chars

const sellSchema = {
  // TODO: Define validation schema
  // symbol: Joi.string().uppercase().length(2, 20).required(),
  // quantity: Joi.number().integer().min(1).required(),
  // price: Joi.number().positive().required(),
  // trade_date: Joi.date().iso().optional(),
  // notes: Joi.string().max(1000).optional().allow('')
};

module.exports = sellSchema;
