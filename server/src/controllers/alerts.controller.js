'use strict';

const AlertsService = require('../services/alerts.service');
const { success, created } = require('../utils/response');

const AlertsController = {

  async getAll(req, res, next) {
    try {
      const data = await AlertsService.getAll();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { symbol, alert_type, target_price } = req.validatedBody || req.body;
      const data = await AlertsService.create(symbol, alert_type, target_price);
      return created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const fields = req.validatedBody || req.body;
      const data = await AlertsService.update(id, fields);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const data = await AlertsService.toggleActive(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await AlertsService.delete(id);
      return success(res, { message: 'Alert deleted' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AlertsController;
