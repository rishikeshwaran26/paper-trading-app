'use strict';

const BuyService = require('../services/buy.service');
const SellService = require('../services/sell.service');
const TradesService = require('../services/trades.service');
const { success, created } = require('../utils/response');

const TradesController = {

  async buy(req, res, next) {
    try {
      const payload = req.validatedBody || req.body;
      const result = await BuyService.executeBuy(payload);
      return created(res, result);
    } catch (err) {
      next(err);
    }
  },

  async sell(req, res, next) {
    try {
      const payload = req.validatedBody || req.body;
      const result = await SellService.executeSell(payload);
      return created(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const filters = req.query;
      const data = await TradesService.getAll(filters);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await TradesService.getById(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TradesController;
