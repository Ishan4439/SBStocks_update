const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { updateAllPrices }    = require("../services/stockService");
const { checkPendingOrders } = require("../services/orderExecutionService");

let io;
let priceInterval;

exports.initSocket = server => {
  io = new Server(server, {
    cors      : { origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true, methods: ["GET","POST"] },
    transports: ["websocket","polling"],
  });

  // Optional auth middleware — guests allowed for market data
  io.use((socket, next) => {
    const token = (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.headers.authorization || "").replace("Bearer ", "");
    if (!token) { socket.userId = null; return next(); }
    try {
      const d = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = d.id;
    } catch (_) { socket.userId = null; }
    next();
  });

  io.on("connection", socket => {
    if (socket.userId) socket.join("user_" + socket.userId);
    socket.join("market");
    socket.on("subscribeStock",   sym => sym && socket.join("stock_"   + String(sym).toUpperCase()));
    socket.on("unsubscribeStock", sym => sym && socket.leave("stock_"  + String(sym).toUpperCase()));
  });

  priceInterval = setInterval(async () => {
    try {
      const map = await updateAllPrices();
      if (!Object.keys(map).length) return;
      io.to("market").emit("priceUpdate", { prices: map, timestamp: new Date().toISOString() });
      await checkPendingOrders(map);
      Object.entries(map).forEach(([sym, data]) =>
        io.to("stock_" + sym).emit("stockPrice", Object.assign({ symbol: sym }, data))
      );
    } catch (err) { console.error("Socket broadcast error:", err.message); }
  }, 3000);

  console.log("⚡ Socket.io ready — prices broadcast every 3s");
  return io;
};

exports.getIO = () => io;
exports.closeSocket = () => { if (priceInterval) clearInterval(priceInterval); if (io) io.close(); };
