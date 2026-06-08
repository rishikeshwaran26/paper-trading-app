'use strict';

const TargetsService = require('../services/targets.service');
const { success, created } = require('../utils/response');

const TargetsController = {

  async getByHoldingId(req, res, next) {
    try {
      const { holdingId } = req.params;
      const data = await TargetsService.getByHoldingId(holdingId);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { holdingId } = req.params;
      const { target_price, quantity } = req.validatedBody || req.body;
      // NOTE: stockId should be resolved from holding inside the service
      const data = await TargetsService.create(holdingId, null, target_price, quantity);
      return created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const fields = req.validatedBody || req.body;
      const data = await TargetsService.update(id, fields);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async markAchieved(req, res, next) {
    try {
      const { id } = req.params;
      const data = await TargetsService.markAchieved(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await TargetsService.delete(id);
      return success(res, { message: 'Target deleted' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TargetsController;
