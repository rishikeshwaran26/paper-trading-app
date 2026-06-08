'use strict';

const { Router } = require('express');

const dashboardRoutes = require('./dashboard.routes');
const portfolioRoutes = require('./portfolio.routes');
const holdingsRoutes = require('./holdings.routes');
const tradesRoutes = require('./trades.routes');
const targetsRoutes = require('./targets.routes');
const stopLossesRoutes = require('./stopLosses.routes');
const alertsRoutes = require('./alerts.routes');
const watchlistRoutes = require('./watchlist.routes');
const stocksRoutes = require('./stocks.routes');
const journalRoutes = require('./journal.routes');

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/holdings', holdingsRoutes);
router.use('/trades', tradesRoutes);
router.use('/targets', targetsRoutes);
router.use('/stop-losses', stopLossesRoutes);
router.use('/alerts', alertsRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/stocks', stocksRoutes);
router.use('/journal', journalRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

module.exports = router;
