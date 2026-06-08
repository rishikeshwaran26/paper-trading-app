'use strict';

const PortfolioService = require('../services/portfolio.service');
const { success, created } = require('../utils/response');

const PortfolioController = {

  async getSummary(req, res, next) {
    try {
      const data = await PortfolioService.getSummary();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getDetailed(req, res, next) {
    try {
      const data = await PortfolioService.getDetailed();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async setCapital(req, res, next) {
    try {
      const { initial_capital } = req.validatedBody || req.body;
      const data = await PortfolioService.setInitialCapital(initial_capital);
      return created(res, data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = PortfolioController;
