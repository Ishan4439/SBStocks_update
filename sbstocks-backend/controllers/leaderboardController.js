const User             = require("../models/User");
const Portfolio        = require("../models/Portfolio");
const { asyncHandler } = require("../middleware/asyncHandler");

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const limit      = parseInt(req.query.limit) || 20;
  const users      = await User.find({ isActive: true, role: "user" }).select("name cashBalance totalTrades badges createdAt");
  const portfolios = await Portfolio.find().select("user totalCurrentValue totalPnLPercent");
  const startBal   = parseFloat(process.env.STARTING_BALANCE) || 100000;

  const portMap = {};
  portfolios.forEach(p => { portMap[p.user.toString()] = p; });

  const ranked = users
    .map(u => {
      const p        = portMap[u._id.toString()];
      const totalVal = ((p && p.totalCurrentValue) || 0) + (u.cashBalance || 0);
      const retPct   = parseFloat(((totalVal - startBal) / startBal * 100).toFixed(2));
      return { userId: u._id, name: u.name, totalValue: parseFloat(totalVal.toFixed(2)), returnPct: retPct, totalTrades: u.totalTrades || 0, badges: (u.badges && u.badges.length) || 0, joinedAt: u.createdAt };
    })
    .sort((a, b) => b.returnPct - a.returnPct)
    .slice(0, limit)
    .map((u, i) => Object.assign({}, u, { rank: i + 1 }));

  const myRank = ranked.findIndex(r => r.userId.toString() === req.user.id) + 1;
  res.json({ success: true, myRank: myRank || null, count: ranked.length, data: ranked });
});
