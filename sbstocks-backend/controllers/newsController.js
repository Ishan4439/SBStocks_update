const axios            = require("axios");
const { asyncHandler } = require("../middleware/asyncHandler");

let cache = { data: null, ts: 0 };
const TTL = 5 * 60 * 1000;

exports.getNews = asyncHandler(async (req, res) => {
  const { symbol, limit = 10 } = req.query;
  const now = Date.now();

  if (!symbol && cache.data && (now - cache.ts) < TTL) {
    return res.json({ success: true, data: cache.data.slice(0, parseInt(limit)) });
  }

  const key   = process.env.NEWS_API_KEY;
  const query = symbol ? symbol + " stock" : "stock market NYSE NASDAQ";

  if (!key || key === "demo") {
    return res.json({ success: true, data: getMock(symbol) });
  }

  try {
    const r = await axios.get("https://newsapi.org/v2/everything", {
      params : { q: query, language: "en", sortBy: "publishedAt", pageSize: 20, apiKey: key },
      timeout: 5000,
    });
    const articles = (r.data.articles || [])
      .filter(a => a.title && a.url && !a.title.includes("[Removed]"))
      .map(a => ({ title: a.title, description: a.description, url: a.url, source: a.source && a.source.name, publishedAt: a.publishedAt, urlToImage: a.urlToImage, sentiment: getSentiment(a.title + " " + (a.description || "")) }));
    if (!symbol) cache = { data: articles, ts: now };
    res.json({ success: true, data: articles.slice(0, parseInt(limit)) });
  } catch (_) {
    res.json({ success: true, data: getMock(symbol) });
  }
});

function getSentiment(text) {
  const t = text.toLowerCase();
  const pos = ["surge","rise","gain","rally","bull","growth","profit","beat","strong","record","high"].filter(w => t.includes(w)).length;
  const neg = ["fall","drop","loss","crash","bear","decline","miss","weak","low","fear","cut"].filter(w => t.includes(w)).length;
  return pos > neg ? "positive" : neg > pos ? "negative" : "neutral";
}

function getMock(sym) {
  const s = sym || "Market";
  return [
    { title: s + " shows strong momentum amid rally",       source: "Reuters",   publishedAt: new Date().toISOString(), sentiment: "positive", url: "#", description: "Markets trending upward." },
    { title: "Investors watch Fed signals as " + s + " trades near highs", source: "Bloomberg", publishedAt: new Date().toISOString(), sentiment: "neutral",  url: "#", description: "Fed policy in focus." },
    { title: "Analysts raise price target for " + s,        source: "CNBC",      publishedAt: new Date().toISOString(), sentiment: "positive", url: "#", description: "Bullish outlook." },
    { title: "Global markets mixed ahead of earnings",      source: "FT",        publishedAt: new Date().toISOString(), sentiment: "neutral",  url: "#", description: "Earnings season approaching." },
    { title: s + " faces headwinds from rising rates",      source: "WSJ",       publishedAt: new Date().toISOString(), sentiment: "negative", url: "#", description: "Rate pressure continues." },
  ];
}
