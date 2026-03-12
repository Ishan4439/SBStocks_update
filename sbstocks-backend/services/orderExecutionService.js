const Order = require("../models/Order");
const { executeTrade } = require("./tradeExecutor");

exports.checkPendingOrders = async (priceMap) => {
  try {
    const pending = await Order.find({ status: "pending", orderType: { $in: ["limit","stoploss"] } });
    for (const order of pending) {
      const livePrice = priceMap[order.symbol] && priceMap[order.symbol].price;
      if (!livePrice) continue;

      let shouldExecute = false;
      if (order.orderType === "limit") {
        if (order.side === "buy"  && livePrice <= order.limitPrice) shouldExecute = true;
        if (order.side === "sell" && livePrice >= order.limitPrice) shouldExecute = true;
      }
      if (order.orderType === "stoploss" && livePrice <= order.stopPrice) shouldExecute = true;

      if (shouldExecute) {
        try {
          await executeTrade(order, livePrice);
          // Notify via socket lazily (avoids circular dep at module load)
          const io = require("../socket/socketHandler").getIO();
          if (io) io.to("user_" + order.user).emit("orderExecuted", { symbol: order.symbol, price: livePrice });
        } catch (err) {
          order.status = "rejected";
          order.notes  = err.message;
          await order.save();
        }
      }
    }
  } catch (err) {
    console.error("checkPendingOrders error:", err.message);
  }
};
