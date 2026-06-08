'use strict';

const HoldingsService = require('../services/holdings.service');
const { success } = require('../utils/response');

const HoldingsController = {

  async getAll(req, res, next) {
    try {
      const data = await HoldingsService.getAll();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await HoldingsService.getById(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async closePosition(req, res, next) {
    try {
      const { id } = req.params;
      await HoldingsService.closePosition(id);
      return success(res, { message: 'Position closed' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = HoldingsController;
