'use strict';

const DashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');

const DashboardController = {

  async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboardData();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DashboardController;
