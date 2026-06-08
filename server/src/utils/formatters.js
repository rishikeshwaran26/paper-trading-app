'use strict';

// Formatting utilities for presentation layer

const formatCurrency = (value, decimals = 2) => {
  return Number(value).toFixed(decimals);
};

const formatPercent = (value, decimals = 2) => {
  return `${Number(value).toFixed(decimals)}%`;
};

const formatDate = (dateStr) => {
  // Returns ISO date string as YYYY-MM-DD
  return dateStr ? dateStr.substring(0, 10) : '';
};

module.exports = { formatCurrency, formatPercent, formatDate };
