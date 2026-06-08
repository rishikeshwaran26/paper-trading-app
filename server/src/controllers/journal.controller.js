'use strict';

const JournalService = require('../services/journal.service');
const { success, created } = require('../utils/response');

const JournalController = {

  async getAll(req, res, next) {
    try {
      const filters = req.query;
      const data = await JournalService.getAll(filters);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await JournalService.getById(id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const payload = req.validatedBody || req.body;
      const data = await JournalService.create(payload);
      return created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const fields = req.validatedBody || req.body;
      const data = await JournalService.update(id, fields);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await JournalService.delete(id);
      return success(res, { message: 'Entry deleted' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = JournalController;
