# 📈 SB Stocks — Paper Trading Platform

> Practice stock trading with virtual funds. Real-time US market data, portfolio analytics, leaderboards, and zero financial risk.

![SB Stocks](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🔥 Trading Engine
- **Market Orders** — Instant execution at live price
- **Limit Orders** — Execute only when stock hits your target price
- **Stop-Loss Orders** — Auto-sell if price drops below threshold
- **Partial Sells** — Sell any quantity of your holdings
- **Market Hours Logic** — Trading disabled outside NSE hours (09:15–15:30)

### 📊 Portfolio Analytics
- Real-time portfolio value tracking
- P&L breakdown: Invested / Current / Absolute Profit / % Return
- Portfolio performance chart (1D / 1W / 1M / 3M / 1Y)
- Sector allocation pie chart
- Daily portfolio snapshots

### 🧠 Smart Features
- Live price feed simulation (Socket.io ready)
- Watchlist with real-time price updates
- Top Gainers / Top Losers dynamically sorted
- Stock News Feed with bullish/bearish sentiment tags
- Market Sentiment indicators (Fear & Greed, VIX)

### 🏆 Competitive
- Global Leaderboard ranked by % return
- 8 Achievements & Badges system
- Daily leaderboard updates

### 💰 Wallet System
- Add virtual funds (UPI / Card / Net Banking simulation)
- Withdraw funds
- Full transaction ledger

### 🔐 Security (Backend Ready)
- JWT Authentication + Refresh Tokens
- Role-based access (User / Admin)
- Bcrypt password hashing
- Rate limiting + Helmet headers
- Input sanitization

### 🌙 UI/UX
- Dark / Light mode toggle
- Animated price flash (Green ↑ Red ↓)
- Skeleton loading screens
- Toast notifications
- Sticky portfolio summary bar
- Live ticker tape
- Responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/sb-stocks.git
cd sb-stocks

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
sb-stocks/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🌐 API Integration (Backend)

This frontend is designed to connect to a MERN stack backend. Configure your `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STOCK_API_KEY=your_alpha_vantage_key
VITE_NEWS_API_KEY=your_newsapi_key
```

### Backend Endpoints Expected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/stocks` | List all stocks |
| GET | `/api/stocks/:sym` | Get stock details |
| GET | `/api/portfolio` | Get user portfolio |
| POST | `/api/orders/buy` | Place buy order |
| POST | `/api/orders/sell` | Place sell order |
| GET | `/api/orders/pending` | Get pending limit/SL orders |
| GET | `/api/wallet` | Get wallet balance |
| POST | `/api/wallet/add` | Add virtual funds |
| POST | `/api/wallet/withdraw` | Withdraw funds |
| GET | `/api/leaderboard` | Get rankings |
| GET | `/api/news` | Get market news |
| GET | `/api/transactions` | Transaction history |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- Custom CSS (no framework — full control)
- Chart.js for analytics charts
- Socket.io-client for live prices
- Redux Toolkit for state management
- Google Fonts: Syne + DM Mono + Instrument Serif

**Backend (separate repo)**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + Bcrypt
- Socket.io
- Helmet + Express-rate-limit
- Express-validator

---

## 📸 Pages

| Page | Description |
|------|-------------|
| Auth | Login / Register with animated toggle |
| Dashboard | Portfolio overview, charts, gainers/losers, news |
| Markets | Full stock listing with search, filter, sort |
| Portfolio | Holdings with P&L, sector pie, performance chart |
| Wallet | Balance, add/withdraw, transaction ledger |
| News | Market news feed with sentiment tags |
| Leaderboard | Global rankings by return % |
| Achievements | Badge collection (8 badges) |
| History | Full transaction log |
| Admin | Stock management panel |

---

## 📄 License

MIT © SB Stocks 2024
