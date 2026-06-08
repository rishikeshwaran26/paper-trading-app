'use strict';

// Orchestrates the full sell trade flow:
// 1. Lookup stock
// 2. Lookup holding (must exist with sufficient quantity)
// 3. Calculate charges
// 4. Compute cost basis and realized P&L
// 5. Execute transaction: insert trade, insert charges, update holding, update cash

const SellService = {

  executeSell({ symbol, quantity, price, tradeDate, notes }) {
    // TODO: Implement sell orchestration
    // 1. Get stock by symbol
    // 2. Get holding for this portfolio + stock
    // 3. Validate holding exists and quantity >= sell_qty
    // 4. Calculate total_value = quantity * price
    // 5. Calculate sell charges
    // 6. Calculate cost basis:
    //    sell_cost_basis = holding.total_invested * (quantity / holding.quantity)
    // 7. Calculate net_proceeds = total_value - total_charges
    // 8. Calculate realized_pnl = net_proceeds - sell_cost_basis
    // 9. BEGIN TRANSACTION
    // 10. Insert trade record
    // 11. Insert trade charges
    // 12. Update holding:
    //     - Reduce quantity
    //     - Reduce total_invested proportionally
    //     - If quantity reaches 0, delete holding row
    // 13. Add cash to portfolio
    // 14. COMMIT
    // 15. Return { trade, charges, realized_pnl, holding, portfolio }
  }
};

module.exports = SellService;
