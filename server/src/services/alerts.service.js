'use strict';

const AlertsModel = require('../models/alerts.model');
const StocksModel = require('../models/stocks.model');
const ApiError = require('../utils/ApiError');

const DEFAULT_USER_ID = 1;

const AlertsService = {

  getAll() {
    return AlertsModel.findByUserId(DEFAULT_USER_ID) || [];
  },

  create(symbol, alertType, targetPrice) {
    const stock = StocksModel.findBySymbol(symbol.toUpperCase().trim());
    if (!stock) {
      throw ApiError.notFound(`Stock '${symbol}' not found`, 'STOCK_NOT_FOUND');
    }
    const id = AlertsModel.insert(DEFAULT_USER_ID, stock.id, alertType, targetPrice);
    return AlertsModel.findById(id);
  },

  update(id, fields) {
    const alert = AlertsModel.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found', 'ALERT_NOT_FOUND');
    }
    AlertsModel.update(id, fields);
    return AlertsModel.findById(id);
  },

  toggleActive(id) {
    const alert = AlertsModel.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found', 'ALERT_NOT_FOUND');
    }
    AlertsModel.toggleActive(id);
    return AlertsModel.findById(id);
  },

  delete(id) {
    const alert = AlertsModel.findById(id);
    if (!alert) {
      throw ApiError.notFound('Alert not found', 'ALERT_NOT_FOUND');
    }
    AlertsModel.delete(id);
  },

  checkAlerts() {
  }
};

module.exports = AlertsService;
