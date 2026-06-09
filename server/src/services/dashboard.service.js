'use strict';

const PortfolioService = require('./portfolio.service');
const TradesService = require('./trades.service');
const WatchlistService = require('./watchlist.service');
const AlertsModel = require('../models/alerts.model');

const DEFAULT_USER_ID = 1;

const DashboardService = {
  getDashboardData() {
    const portfolioSummary = PortfolioService.getSummary();

    let topHoldings = [];
    let holdingsCount = 0;
    if (portfolioSummary) {
      const detailed = PortfolioService.getDetailed();
      holdingsCount = detailed ? detailed.holdings_count : 0;
      if (detailed && detailed.holdings) {
        topHoldings = detailed.holdings
          .slice()
          .sort((a, b) => b.current_value - a.current_value)
          .slice(0, 5);
      }
    }

    const recentTrades = TradesService.getAll({ limit: 10 });
    const watchlistItems = WatchlistService.getAll();
    const activeAlertsCount = AlertsModel.countActive(DEFAULT_USER_ID);

    return {
      portfolio: portfolioSummary,
      top_holdings: topHoldings,
      recent_trades: recentTrades,
      watchlist_count: watchlistItems.length,
      active_alerts_count: activeAlertsCount,
      open_positions_count: holdingsCount
    };
  }
};

module.exports = DashboardService;
