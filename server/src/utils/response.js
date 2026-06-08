'use strict';

// Standardized response helpers

const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const successPaginated = (res, data, meta, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta
  });
};

const created = (res, data) => {
  return success(res, data, 201);
};

module.exports = { success, successPaginated, created };
