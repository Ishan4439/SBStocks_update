const Order       = require("../models/Order");
const User        = require("../models/User");
const Portfolio   = require("../models/Portfolio");
const Transaction = require("../models/Transaction");

const executeTrade = async (order, execPrice) => {
  const user      = await User.findById(order.user);
  const portfolio = await Portfolio.findOne({ user: order.user });
  if (!user)      throw new Error("User not found");
  if (!portfolio) throw new Error("Portfolio not found");

  const qty       = order.quantity;
  const totalCost = parseFloat((execPrice * qty).toFixed(2));

  if (order.side === "buy") {
    if (user.cashBalance < totalCost) throw new Error("Insufficient cash balance");
    user.cashBalance = parseFloat((user.cashBalance - totalCost).toFixed(2));

    const idx = portfolio.holdings.findIndex(h => h.symbol === order.symbol);
    if (idx >= 0) {
      const h    = portfolio.holdings[idx];
      const nQty = h.quantity + qty;
      portfolio.holdings[idx].averagePrice   = parseFloat(((h.investedAmount + totalCost) / nQty).toFixed(4));
      portfolio.holdings[idx].quantity       = nQty;
      portfolio.holdings[idx].investedAmount = parseFloat((h.investedAmount + totalCost).toFixed(2));
    } else {
      portfolio.holdings.push({ stock: order.stock, symbol: order.symbol, quantity: qty, averagePrice: execPrice, investedAmount: totalCost });
    }

    await Transaction.create({ user: order.user, type: "buy", symbol: order.symbol, quantity: qty, price: execPrice, amount: -totalCost, balanceAfter: user.cashBalance, orderType: order.orderType, order: order._id });

  } else {
    const idx = portfolio.holdings.findIndex(h => h.symbol === order.symbol);
    if (idx < 0 || portfolio.holdings[idx].quantity < qty) throw new Error("Insufficient shares to sell");

    const h        = portfolio.holdings[idx];
    const proceeds = parseFloat((execPrice * qty).toFixed(2));
    const cost     = parseFloat((h.averagePrice * qty).toFixed(2));
    const pnl      = parseFloat((proceeds - cost).toFixed(2));
    const pnlPct   = parseFloat((pnl / cost * 100).toFixed(2));

    user.cashBalance = parseFloat((user.cashBalance + proceeds).toFixed(2));
    const nQty = h.quantity - qty;
    if (nQty <= 0) portfolio.holdings.splice(idx, 1);
    else {
      portfolio.holdings[idx].quantity       = nQty;
      portfolio.holdings[idx].investedAmount = parseFloat((h.averagePrice * nQty).toFixed(2));
    }

    await Transaction.create({ user: order.user, type: "sell", symbol: order.symbol, quantity: qty, price: execPrice, amount: proceeds, balanceAfter: user.cashBalance, orderType: order.orderType, order: order._id, pnl, pnlPercent: pnlPct });
    if (pnl > 0) user.profitableTrades += 1;
  }

  order.executedPrice = execPrice;
  order.totalAmount   = totalCost;
  order.status        = "executed";
  order.executedAt    = new Date();
  user.totalTrades   += 1;

  await order.save();
  await portfolio.save();
  await user.save();

  // Award badges (non-blocking)
  try {
    const BADGES = [
      { id: "first_trade",     check: u => u.totalTrades >= 1 },
      { id: "ten_profit",      check: u => u.profitableTrades >= 10 },
      { id: "five_pct_growth", check: (u, p) => (p.totalPnLPercent || 0) >= 5 },
      { id: "star_trader",     check: (u, p) => (p.totalPnLPercent || 0) >= 50 },
      { id: "day_trader",      check: u => u.totalTrades >= 5 },
    ];
    let changed = false;
    for (const b of BADGES) {
      if (!user.badges.includes(b.id) && b.check(user, portfolio)) {
        user.badges.push(b.id);
        changed = true;
      }
    }
    if (changed) await user.save();
  } catch (_) {}

  return { user, portfolio, order };
};

module.exports = { executeTrade };
