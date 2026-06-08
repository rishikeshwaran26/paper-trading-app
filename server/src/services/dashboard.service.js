'use strict';

// Aggregates data from multiple services for the dashboard page.
// This is the only service that calls other services directly.

const PortfolioService = require('./portfolio.service');
const HoldingsService = require('./holdings.service');
const TradesService = require('./trades.service');
const WatchlistService = require('./watchlist.service');
const AlertsModel = require('../models/alerts.model');

const DashboardService = {

  getDashboardData() {
    // TODO: Aggregate all dashboard data
    // 1. Portfolio summary from PortfolioService
    // 2. Top holdings (sorted by current value, limit 5)
    // 3. Recent trades (limit 10)
    // 4. Watchlist preview (limit 5)
    // 5. Active alerts count
    // Return combined object
  }
};

module.exports = DashboardService;
