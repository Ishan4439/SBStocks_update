const Portfolio        = require("../models/Portfolio");
const Stock            = require("../models/Stock");
const User             = require("../models/User");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");

exports.getPortfolio = asyncHandler(async (req, res, next) => {
  let portfolio = await Portfolio.findOne({ user: req.user.id });
  if (!portfolio) {
    portfolio = await Portfolio.create({ user: req.user.id, holdings: [] });
  }

  const user    = await User.findById(req.user.id);
  const stocks  = await Stock.find({ isActive: true }).select("symbol name currentPrice sector changePercent change");
  const priceMap = {};
  stocks.forEach(s => { priceMap[s.symbol] = s; });

  // Recalculate P&L
  const prices = {};
  stocks.forEach(s => { prices[s.symbol] = s.currentPrice; });
  portfolio.recalculate(prices);

  const enriched = portfolio.holdings.filter(h => h.quantity > 0).map(h => {
    const s       = priceMap[h.symbol];
    const live    = (s && s.currentPrice) || h.averagePrice;
    const pnl     = parseFloat(((live - h.averagePrice) * h.quantity).toFixed(2));
    const pnlPct  = parseFloat(((live - h.averagePrice) / h.averagePrice * 100).toFixed(2));
    const curVal  = parseFloat((live * h.quantity).toFixed(2));
    return { symbol: h.symbol, name: (s && s.name) || h.symbol, sector: (s && s.sector) || "Other", quantity: h.quantity, averagePrice: h.averagePrice, currentPrice: live, investedAmount: h.investedAmount, currentValue: curVal, pnl, pnlPercent: pnlPct };
  });

  // Sector allocation
  const sMap = {};
  enriched.forEach(h => { sMap[h.sector] = (sMap[h.sector] || 0) + h.currentValue; });
  const totalVal = portfolio.totalCurrentValue + user.cashBalance;
  const sectorAllocation = Object.entries(sMap).map(([sector, value]) => ({ sector, value: parseFloat(value.toFixed(2)), percent: parseFloat((value / (totalVal || 1) * 100).toFixed(1)) }));
  if (user.cashBalance > 0) sectorAllocation.push({ sector: "Cash", value: parseFloat(user.cashBalance.toFixed(2)), percent: parseFloat((user.cashBalance / (totalVal || 1) * 100).toFixed(1)) });

  // Daily snapshot
  const today = new Date(); today.setHours(0,0,0,0);
  const snapped = portfolio.snapshots.some(s => { const d = new Date(s.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); });
  if (!snapped) {
    portfolio.snapshots.push({ date: new Date(), totalValue: totalVal, cashBalance: user.cashBalance, investedAmt: portfolio.totalInvested });
    if (portfolio.snapshots.length > 365) portfolio.snapshots = portfolio.snapshots.slice(-365);
  }

  await portfolio.save();

  res.json({ success: true, data: { holdings: enriched, totalInvested: portfolio.totalInvested, totalValue: portfolio.totalCurrentValue, totalPnL: portfolio.totalPnL, totalPnLPercent: portfolio.totalPnLPercent, cashBalance: user.cashBalance, portfolioTotal: parseFloat((portfolio.totalCurrentValue + user.cashBalance).toFixed(2)), sectorAllocation, snapshots: portfolio.snapshots.slice(-30) } });
});

exports.getSnapshots = asyncHandler(async (req, res, next) => {
  const { period = "1M" } = req.query;
  let portfolio = await Portfolio.findOne({ user: req.user.id }).select("snapshots");
  if (!portfolio) return next(new ErrorResponse("Portfolio not found", 404));
  const days = { "1D":1,"1W":7,"1M":30,"3M":90,"1Y":365 }[period] || 30;
  res.json({ success: true, period, data: portfolio.snapshots.slice(-days) });
});
