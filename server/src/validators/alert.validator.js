'use strict';

// Validation schema for POST /api/alerts
// TODO: Implement with Joi or Zod
//
// Required fields:
//   symbol: string, uppercase, 2-20 chars
//   alert_type: 'ABOVE' or 'BELOW'
//   target_price: number, > 0

const alertSchema = {
  // TODO: Define validation schema
  // symbol: Joi.string().uppercase().length(2, 20).required(),
  // alert_type: Joi.string().valid('ABOVE', 'BELOW').required(),
  // target_price: Joi.number().positive().required()
};

module.exports = alertSchema;
