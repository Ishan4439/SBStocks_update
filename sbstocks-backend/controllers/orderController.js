const Order            = require("../models/Order");
const Stock            = require("../models/Stock");
const User             = require("../models/User");
const Portfolio        = require("../models/Portfolio");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");
const { executeTrade } = require("../services/tradeExecutor");

exports.placeOrder = asyncHandler(async (req, res, next) => {
  const { symbol, side, orderType, quantity, limitPrice, stopPrice } = req.body;
  const sym = String(symbol).toUpperCase();

  // Market hours check (NSE 09:15-15:30 IST, all days)
  if (orderType === "market") {
    const now    = new Date();
    const istMin = ((now.getUTCHours() * 60 + now.getUTCMinutes()) + 330) % 1440;
    if (istMin < 555 || istMin > 930) {
      return next(new ErrorResponse("Market is closed. Trading hours: 09:15-15:30 IST (all days)", 400));
    }
  }

  const stock = await Stock.findOne({ symbol: sym, isActive: true });
  if (!stock) return next(new ErrorResponse("Stock " + sym + " not found", 404));

  const user = await User.findById(req.user.id);
  const qty  = parseInt(quantity);

  if (side === "buy") {
    const cost = stock.currentPrice * qty;
    if (user.cashBalance < cost) return next(new ErrorResponse("Insufficient balance. Need $" + cost.toFixed(2) + ", have $" + user.cashBalance.toFixed(2), 400));
  } else {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    const holding   = portfolio && portfolio.holdings.find(h => h.symbol === sym);
    if (!holding || holding.quantity < qty) return next(new ErrorResponse("Insufficient shares. Own: " + (holding ? holding.quantity : 0), 400));
  }

  const order = await Order.create({
    user: req.user.id, stock: stock._id, symbol: sym,
    orderType, side, quantity: qty,
    limitPrice: orderType === "limit"    ? parseFloat(limitPrice) : null,
    stopPrice : orderType === "stoploss" ? parseFloat(stopPrice)  : null,
  });

  if (orderType === "market") {
    try {
      const result = await executeTrade(order, stock.currentPrice);
      try {
        const io = require("../socket/socketHandler").getIO();
        if (io) {
          io.to("user_" + req.user.id).emit("orderExecuted", { order: result.order, balance: result.user.cashBalance });
          io.to("user_" + req.user.id).emit("portfolioUpdate", result.portfolio);
        }
      } catch (_) {}
      return res.status(201).json({ success: true, message: side.toUpperCase() + " executed: " + qty + " x " + sym + " @ $" + stock.currentPrice.toFixed(2), data: result.order });
    } catch (err) {
      await Order.findByIdAndUpdate(order._id, { status: "rejected", notes: err.message });
      return next(new ErrorResponse(err.message, 400));
    }
  }

  res.status(201).json({ success: true, message: orderType + " order placed — will execute when price conditions are met", data: order });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const q = { user: req.user.id };
  if (status) q.status    = status;
  if (type)   q.orderType = type;
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Order.countDocuments(q);
  const data  = await Order.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  res.json({ success: true, count: data.length, total, data });
});

exports.getPendingOrders = asyncHandler(async (req, res) => {
  const data = await Order.find({ user: req.user.id, status: "pending" }).sort({ createdAt: -1 });
  res.json({ success: true, count: data.length, data });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return next(new ErrorResponse("Order not found", 404));
  if (order.status !== "pending") return next(new ErrorResponse("Only pending orders can be cancelled", 400));
  order.status = "cancelled"; order.cancelledAt = new Date();
  await order.save();
  res.json({ success: true, message: "Order cancelled", data: order });
});
