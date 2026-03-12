const Stock            = require("../models/Stock");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");

exports.getAllStocks = asyncHandler(async (req, res) => {
  const { sector, search, sortBy = "symbol", order = "asc", page = 1, limit = 50 } = req.query;
  const q = { isActive: true };
  if (sector && sector !== "All") q.sector = sector;
  if (search) q.$or = [{ symbol: { $regex: search, $options: "i" } }, { name: { $regex: search, $options: "i" } }];
  const sortField = { symbol: "symbol", price: "currentPrice", change: "changePercent" }[sortBy] || "symbol";
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Stock.countDocuments(q);
  const data  = await Stock.find(q).sort({ [sortField]: order === "desc" ? -1 : 1 }).skip(skip).limit(parseInt(limit)).select("-__v -priceHistory");
  res.json({ success: true, count: data.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data });
});

exports.getGainers = asyncHandler(async (req, res) => {
  const data = await Stock.find({ isActive: true, changePercent: { $gt: 0 } }).sort({ changePercent: -1 }).limit(10).select("symbol name currentPrice changePercent change");
  res.json({ success: true, data });
});

exports.getLosers = asyncHandler(async (req, res) => {
  const data = await Stock.find({ isActive: true, changePercent: { $lt: 0 } }).sort({ changePercent: 1 }).limit(10).select("symbol name currentPrice changePercent change");
  res.json({ success: true, data });
});

exports.getStock = asyncHandler(async (req, res, next) => {
  const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase(), isActive: true });
  if (!stock) return next(new ErrorResponse("Stock not found", 404));
  res.json({ success: true, data: stock });
});

exports.getLivePrice = asyncHandler(async (req, res, next) => {
  const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase(), isActive: true });
  if (!stock) return next(new ErrorResponse("Stock not found", 404));
  res.json({ success: true, symbol: stock.symbol, price: stock.currentPrice, lastUpdated: stock.lastUpdated });
});

exports.createStock = asyncHandler(async (req, res, next) => {
  const symbol = (req.body.symbol || "").toUpperCase();
  if (await Stock.findOne({ symbol })) return next(new ErrorResponse("Stock already exists", 400));
  const stock = await Stock.create({ ...req.body, symbol, previousClose: req.body.currentPrice, openPrice: req.body.currentPrice });
  res.status(201).json({ success: true, data: stock });
});

exports.updateStock = asyncHandler(async (req, res, next) => {
  const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!stock) return next(new ErrorResponse("Stock not found", 404));
  res.json({ success: true, data: stock });
});

exports.deleteStock = asyncHandler(async (req, res, next) => {
  const stock = await Stock.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!stock) return next(new ErrorResponse("Stock not found", 404));
  res.json({ success: true, message: "Stock deactivated" });
});
