'use strict';

// Factory middleware: takes a validation schema, returns middleware
// that validates req.body against it.

const validateRequest = (schema) => {
  return (req, res, next) => {
    // TODO: Implement validation using Joi or Zod
    // const { error, value } = schema.validate(req.body);
    // if (error) {
    //   return res.status(400).json({
    //     success: false,
    //     error: {
    //       message: error.details[0].message,
    //       code: 'VALIDATION_ERROR'
    //     }
    //   });
    // }
    // req.validatedBody = value;
    next();
  };
};

module.exports = validateRequest;
