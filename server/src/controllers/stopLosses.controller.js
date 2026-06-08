'use strict';

const StopLossesService = require('../services/stopLosses.service');
const { success, created } = require('../utils/response');

const StopLossesController = {

  async getByHoldingId(req, res, next) {
    try {
      const { holdingId } = req.params;
      const data = await StopLossesService.getByHoldingId(holdingId);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { holdingId } = req.params;
      const { stop_price, quantity } = req.validatedBody || req.body;
      const data = await StopLossesService.create(holdingId, null, stop_price, quantity);
      return created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const fields = req.validatedBody || req.body;
      const data = await StopLossesService.update(id, fields);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async markTriggered(req, res, next) {
    try {
      const { id } = req.params;
      const data = await StopLossesService.markTriggered(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await StopLossesService.delete(id);
      return success(res, { message: 'Stop loss deleted' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = StopLossesController;
