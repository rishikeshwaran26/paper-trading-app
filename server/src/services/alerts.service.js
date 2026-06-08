'use strict';

const AlertsModel = require('../models/alerts.model');
const StocksModel = require('../models/stocks.model');

const AlertsService = {

  getAll() {
    // TODO: Get all alerts for user, sorted by status and creation date
  },

  create(symbol, alertType, targetPrice) {
    // TODO: Create a new price alert
    // 1. Lookup stock by symbol
    // 2. Insert alert record
    // 3. Return created alert with stock info
  },

  update(id, fields) {
    // TODO: Update alert type or target price
  },

  toggleActive(id) {
    // TODO: Toggle is_active flag
  },

  delete(id) {
    // TODO: Delete an alert
  },

  checkAlerts() {
    // TODO: Check all active alerts against current prices
    // 1. Get all active, non-triggered alerts
    // 2. For each, get latest price
    // 3. If price crosses threshold, mark triggered
    // 4. (future: send notification)
  }
};

module.exports = AlertsService;
