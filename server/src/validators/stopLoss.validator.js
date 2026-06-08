'use strict';

// Validation schema for POST /api/holdings/:holdingId/stop-losses
// TODO: Implement with Joi or Zod
//
// Required fields:
//   stop_price: number, > 0
//
// Optional fields:
//   quantity: integer, > 0 (null = entire position)

const stopLossSchema = {
  // TODO: Define validation schema
  // stop_price: Joi.number().positive().required(),
  // quantity: Joi.number().integer().min(1).optional().allow(null)
};

module.exports = stopLossSchema;
