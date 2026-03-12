const axios = require("axios");
const Stock = require("../models/Stock");

exports.updateAllPrices = async () => {
  try {
    const stocks = await Stock.find({ isActive: true });
    if (!stocks.length) return {};

    const updates = stocks.map(stock => {
      const vol        = getVol(stock.symbol);
      const shock      = (Math.random() - 0.495) * vol;
      const newPrice   = parseFloat((stock.currentPrice * (1 + shock)).toFixed(2));
      const safePrice  = Math.max(newPrice, 0.01);
      const prevClose  = stock.previousClose || safePrice;
      const change     = parseFloat((safePrice - prevClose).toFixed(2));
      const changePct  = parseFloat((change / prevClose * 100).toFixed(2));
      const history    = [...(stock.priceHistory || []).slice(-19), { price: safePrice, timestamp: new Date() }];

      return {
        updateOne: {
          filter: { _id: stock._id },
          update: { $set: { currentPrice: safePrice, change, changePercent: changePct,
            dayHigh: Math.max(stock.dayHigh || safePrice, safePrice),
            dayLow : Math.min(stock.dayLow  || safePrice, safePrice),
            priceHistory: history, lastUpdated: new Date() } },
        },
      };
    });

    await Stock.bulkWrite(updates);

    const updated = await Stock.find({ isActive: true }).select("symbol currentPrice change changePercent");
    const map = {};
    updated.forEach(s => { map[s.symbol] = { price: s.currentPrice, change: s.change, changePercent: s.changePercent }; });
    return map;
  } catch (err) {
    console.error("Price update error:", err.message);
    return {};
  }
};

function getVol(sym) {
  const v = { TSLA:0.018,NVDA:0.015,META:0.012,AMZN:0.010,AAPL:0.008,MSFT:0.007,GOOGL:0.009,JPM:0.006,BAC:0.007,XOM:0.009,JNJ:0.005,WMT:0.006 };
  return v[sym] || 0.010;
}
