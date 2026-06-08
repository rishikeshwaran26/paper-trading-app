'use strict';

const StocksService = require('../services/stocks.service');
const { success } = require('../utils/response');

const StocksController = {

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const data = await StocksService.search(q);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getBySymbol(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await StocksService.getBySymbol(symbol.toUpperCase());
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getPriceHistory(req, res, next) {
    try {
      const { symbol } = req.params;
      const { from, to } = req.query;
      const data = await StocksService.getPriceHistory(symbol.toUpperCase(), from, to);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = StocksController;
