'use strict';

const WatchlistService = require('../services/watchlist.service');
const { success, created } = require('../utils/response');

const WatchlistController = {

  async getAll(req, res, next) {
    try {
      const data = await WatchlistService.getAll();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async add(req, res, next) {
    try {
      const { symbol, notes } = req.validatedBody || req.body;
      const data = await WatchlistService.add(symbol, notes);
      return created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      await WatchlistService.remove(id);
      return success(res, { message: 'Removed from watchlist' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = WatchlistController;
