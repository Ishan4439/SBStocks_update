const Watchlist        = require("../models/Watchlist");
const Stock            = require("../models/Stock");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");

exports.getWatchlist = asyncHandler(async (req, res) => {
  let wl = await Watchlist.findOne({ user: req.user.id }).populate("stocks.stock","symbol name currentPrice changePercent change sector");
  if (!wl) wl = await Watchlist.create({ user: req.user.id, stocks: [] });
  const data = wl.stocks.map(item => ({ symbol: item.symbol, name: item.stock && item.stock.name, price: item.stock && item.stock.currentPrice, change: item.stock && item.stock.change, changePercent: item.stock && item.stock.changePercent, sector: item.stock && item.stock.sector, alertPrice: item.alertPrice, addedAt: item.addedAt }));
  res.json({ success: true, count: data.length, data });
});

exports.addToWatchlist = asyncHandler(async (req, res, next) => {
  const sym   = req.params.symbol.toUpperCase();
  const stock = await Stock.findOne({ symbol: sym, isActive: true });
  if (!stock) return next(new ErrorResponse("Stock " + sym + " not found", 404));
  let wl = await Watchlist.findOne({ user: req.user.id });
  if (!wl) wl = await Watchlist.create({ user: req.user.id, stocks: [] });
  if (wl.stocks.some(s => s.symbol === sym)) return next(new ErrorResponse(sym + " already in watchlist", 400));
  if (wl.stocks.length >= 20) return next(new ErrorResponse("Watchlist limit: 20 stocks", 400));
  wl.stocks.push({ stock: stock._id, symbol: sym, alertPrice: req.body.alertPrice || null });
  await wl.save();
  res.status(201).json({ success: true, message: sym + " added to watchlist" });
});

exports.removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const sym = req.params.symbol.toUpperCase();
  const wl  = await Watchlist.findOne({ user: req.user.id });
  if (!wl) return next(new ErrorResponse("Watchlist not found", 404));
  const before = wl.stocks.length;
  wl.stocks = wl.stocks.filter(s => s.symbol !== sym);
  if (wl.stocks.length === before) return next(new ErrorResponse(sym + " not in watchlist", 404));
  await wl.save();
  res.json({ success: true, message: sym + " removed from watchlist" });
});
