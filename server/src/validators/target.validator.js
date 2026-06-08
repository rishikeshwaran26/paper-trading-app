'use strict';

// Validation schema for POST /api/holdings/:holdingId/targets
// TODO: Implement with Joi or Zod
//
// Required fields:
//   target_price: number, > 0
//
// Optional fields:
//   quantity: integer, > 0 (null = entire remaining position)

const targetSchema = {
  // TODO: Define validation schema
  // target_price: Joi.number().positive().required(),
  // quantity: Joi.number().integer().min(1).optional().allow(null)
};

module.exports = targetSchema;
