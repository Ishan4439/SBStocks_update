import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   API LAYER
═══════════════════════════════════════════════════════════════ */
const import_meta_env = typeof window !== "undefined" && window.__ENV__ ? window.__ENV__ : {};
const API_BASE = import_meta_env.VITE_API_URL || "http://localhost:5000/api";
let _token = null;
const setToken = t => { _token = t; if (t) localStorage.setItem("sb_token",t); else localStorage.removeItem("sb_token"); };
const getToken = () => _token || localStorage.getItem("sb_token");

async function apiCall(method, path, body) {
  try {
    const headers = { "Content-Type": "application/json" };
    const t = getToken();
    if (t) headers["Authorization"] = "Bearer " + t;
    const res = await fetch(API_BASE + path, { method, headers, credentials: "include", body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  } catch(err) {
    if (err.message && err.message.includes("fetch")) throw new Error("Cannot connect to server. Is the backend running on port 5000?");
    throw err;
  }
}

const API = {
  register : (n,e,p)  => apiCall("POST","/auth/register",{name:n,email:e,password:p}),
  login    : (e,p)    => apiCall("POST","/auth/login",{email:e,password:p}),
  logout   : ()       => apiCall("POST","/auth/logout"),
  getMe    : ()       => apiCall("GET","/auth/me"),
  getStocks: (q)      => apiCall("GET","/stocks?"+(q||"limit=50")),
  getGainers:()       => apiCall("GET","/stocks/gainers"),
  getLosers: ()       => apiCall("GET","/stocks/losers"),
  getStock : s        => apiCall("GET","/stocks/"+s),
  placeOrder:(b)      => apiCall("POST","/orders",b),
  getOrders: ()       => apiCall("GET","/orders"),
  cancelOrder:(id)    => apiCall("DELETE","/orders/"+id),
  getPortfolio:()     => apiCall("GET","/portfolio"),
  getSnapshots:(p)    => apiCall("GET","/portfolio/snapshots?period="+(p||"1M")),
  getWallet:()        => apiCall("GET","/wallet"),
  addFunds:(a)        => apiCall("POST","/wallet/add",{amount:a}),
  withdraw:(a)        => apiCall("POST","/wallet/withdraw",{amount:a}),
  getLedger:()        => apiCall("GET","/wallet/ledger"),
  getTransactions:()  => apiCall("GET","/transactions"),
  getTxStats:()       => apiCall("GET","/transactions/stats"),
  getWatchlist:()     => apiCall("GET","/watchlist"),
  addWatchlist:(s)    => apiCall("POST","/watchlist/"+s),
  removeWatchlist:(s) => apiCall("DELETE","/watchlist/"+s),
  getLeaderboard:()   => apiCall("GET","/leaderboard"),
  getNews:()          => apiCall("GET","/news"),
};

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES — FIXED FOR 100% DESKTOP ZOOM
═══════════════════════════════════════════════════════════════ */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&display=swap');`;

const GLOBAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090f;--surface:#0d1117;--surface2:#111820;--surface3:#161f2a;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --accent:#00e5a0;--accent2:#0070f3;--accent3:#7c3aed;
  --danger:#ff4d6d;--warn:#f5a623;--info:#38bdf8;
  --text:#e8ecf0;--text2:#a0aec0;--muted:#5a6478;
  --card:#0e1520;--card2:#121a26;
  --glow:rgba(0,229,160,0.12);--glow2:rgba(0,112,243,0.1);
  --radius:10px;--radius-sm:7px;--radius-lg:14px;
  --shadow:0 4px 24px rgba(0,0,0,0.4);
  --font-display:'Syne',sans-serif;
  --font-mono:'DM Mono',monospace;
  --font-serif:'Instrument Serif',serif;
  --transition:0.18s ease;
  --sidebar-w:148px;
}
body.theme-light{
  --bg:#f0f4f8;--surface:#ffffff;--surface2:#f7f9fc;--surface3:#edf2f7;
  --border:rgba(0,0,0,0.08);--border2:rgba(0,0,0,0.15);
  --text:#1a202c;--text2:#4a5568;--muted:#a0aec0;
  --card:#ffffff;--card2:#f7f9fc;
  --glow:rgba(0,229,160,0.08);--glow2:rgba(0,112,243,0.06);
  --shadow:0 4px 24px rgba(0,0,0,0.08);
}
html{font-size:13px;scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font-mono);min-height:100vh;overflow-x:hidden;transition:background 0.3s,color 0.3s}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--muted);border-radius:2px}
::selection{background:rgba(0,229,160,0.2);color:var(--text)}

/* ── Animations ── */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideDown{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes flashGreen{0%,100%{background:transparent}50%{background:rgba(0,229,160,0.18)}}
@keyframes flashRed{0%,100%{background:transparent}50%{background:rgba(255,77,109,0.18)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes toastOut{from{transform:translateX(0);opacity:1}to{transform:translateX(110%);opacity:0}}
@keyframes badgePop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(0,229,160,0.2)}50%{box-shadow:0 0 24px rgba(0,229,160,0.5)}}

/* ── Layout ── */
.app-wrapper{display:flex;min-height:100vh}

/* ── Sidebar — compact fixed width ── */
.sidebar{
  width:var(--sidebar-w);min-width:var(--sidebar-w);background:var(--surface);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;bottom:0;z-index:100;
  transition:transform 0.3s ease,background 0.3s;
  overflow-y:auto;overflow-x:hidden;
}
.sidebar-logo{
  padding:14px 12px 10px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:8px;flex-shrink:0;
}
.logo-mark{
  width:30px;height:30px;border-radius:8px;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:800;font-size:12px;color:#000;
  animation:glow 3s ease-in-out infinite;
}
.logo-text{font-family:var(--font-display);font-weight:800;font-size:14px;letter-spacing:-0.5px;line-height:1.1}
.logo-text span{color:var(--accent)}
.logo-sub{font-size:8px;color:var(--muted);letter-spacing:1px;margin-top:1px}

.sidebar-section{padding:10px 8px 2px}
.sidebar-label{font-size:8px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;padding:0 8px 6px;display:flex;align-items:center;gap:5px}
.nav-item{
  display:flex;align-items:center;gap:8px;
  padding:6px 8px;border-radius:6px;cursor:pointer;
  color:var(--muted);font-size:11px;letter-spacing:0.2px;
  transition:all var(--transition);margin-bottom:1px;
  border:1px solid transparent;position:relative;
  font-family:var(--font-mono);white-space:nowrap;
}
.nav-item:hover{background:rgba(255,255,255,0.04);color:var(--text);border-color:var(--border)}
.nav-item.active{background:rgba(0,229,160,0.08);color:var(--accent);border-color:rgba(0,229,160,0.2)}
.nav-item.active::before{content:'';position:absolute;left:-1px;top:20%;bottom:20%;width:2px;background:var(--accent);border-radius:0 2px 2px 0}
.nav-icon{width:16px;text-align:center;font-size:13px;flex-shrink:0}
.nav-badge{margin-left:auto;background:var(--accent);color:#000;font-size:8px;font-weight:700;padding:1px 5px;border-radius:10px;min-width:16px;text-align:center;flex-shrink:0}
.nav-badge.warn{background:var(--warn)}
.nav-badge.danger{background:var(--danger);color:#fff}

.sidebar-footer{margin-top:auto;padding:10px 8px;border-top:1px solid var(--border);flex-shrink:0}
.user-card{padding:8px;border-radius:6px;cursor:pointer;transition:background var(--transition);border:1px solid transparent}
.user-card:hover{background:rgba(255,255,255,0.04);border-color:var(--border)}
.user-card-inner{display:flex;align-items:center;gap:8px}
.avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:10px;color:#000;flex-shrink:0}
.user-name{font-size:11px;font-weight:600;font-family:var(--font-display);color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px}
.user-role{font-size:8px;color:var(--muted);margin-top:1px}
.user-balance{font-size:9px;color:var(--accent);font-weight:600;margin-top:1px}
.market-status{display:flex;align-items:center;gap:5px;padding:5px 8px;margin-top:6px;border-radius:5px;font-size:9px;border:1px solid var(--border);flex-wrap:wrap}
.status-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.status-dot.open{background:var(--accent);animation:pulse 1.5s infinite}
.status-dot.closed{background:var(--muted)}

/* ── Main — offset by sidebar ── */
.main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column;min-height:100vh;min-width:0}

/* ── Topbar — compact, never wraps ── */
.topbar{
  height:44px;display:flex;align-items:center;gap:5px;
  padding:0 10px;background:var(--surface);
  border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:50;
  transition:background 0.3s;
  min-width:0;overflow:hidden;
}
.topbar-title{font-family:var(--font-display);font-weight:700;font-size:12px;white-space:nowrap;flex-shrink:0}
.topbar-crumb{color:var(--muted);font-weight:400;font-size:10px;margin-left:3px;font-family:var(--font-mono)}
.topbar-spacer{flex:1;min-width:4px}

.search-wrap{position:relative;width:160px;flex-shrink:0}
.search-box{
  display:flex;align-items:center;gap:5px;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:6px;padding:5px 8px;width:100%;
  transition:border-color 0.2s,box-shadow 0.2s;
}
.search-box:focus-within{border-color:rgba(0,229,160,0.4);box-shadow:0 0 0 2px rgba(0,229,160,0.06)}
.search-box input{background:none;border:none;outline:none;color:var(--text);font-family:var(--font-mono);font-size:11px;width:100%;min-width:0}
.search-box input::placeholder{color:var(--muted)}
.search-results{
  position:absolute;top:calc(100% + 5px);left:0;right:0;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:6px;overflow:hidden;
  box-shadow:var(--shadow);z-index:200;
  animation:slideDown 0.15s ease;
}
.search-result-item{display:flex;align-items:center;gap:7px;padding:7px 9px;cursor:pointer;transition:background var(--transition)}
.search-result-item:hover{background:var(--surface2)}
.sri-sym{font-family:var(--font-display);font-weight:700;font-size:11px}
.sri-name{font-size:9px;color:var(--muted);flex:1}
.sri-price{font-size:10px;font-family:var(--font-display)}

.icon-btn{
  width:30px;height:30px;border-radius:6px;flex-shrink:0;
  background:var(--surface2);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--muted);font-size:12px;
  transition:all var(--transition);position:relative;
}
.icon-btn:hover{border-color:rgba(0,229,160,0.3);color:var(--accent)}
.notif-badge{position:absolute;top:4px;right:4px;width:6px;height:6px;border-radius:50%;background:var(--danger);border:1px solid var(--surface)}

/* ── Ticker Tape ── */
.ticker-tape{background:var(--surface);border-bottom:1px solid var(--border);overflow:hidden;padding:3px 0;cursor:default;flex-shrink:0}
.ticker-inner{display:inline-flex;white-space:nowrap;animation:ticker 50s linear infinite}
.ticker-inner:hover{animation-play-state:paused}
.tick-item{display:inline-flex;align-items:center;gap:5px;padding:0 12px;font-size:9px;border-right:1px solid var(--border)}
.tick-sym{font-family:var(--font-display);font-weight:700;font-size:10px}
.tick-price{color:var(--text2)}
.tick-chg{font-size:9px}

/* ── Content ── */
.content{padding:8px 10px;flex:1}

/* ── Sticky Portfolio Summary ── */
.sticky-bar{
  position:sticky;top:44px;z-index:40;
  background:var(--surface);border-bottom:1px solid var(--border);
  padding:4px 10px;display:flex;align-items:center;gap:8px;
  transition:background 0.3s;min-width:0;overflow:hidden;flex-wrap:nowrap;
}
.sticky-stat{display:flex;align-items:center;gap:5px;flex-shrink:0}
.sticky-label{font-size:9px;color:var(--muted);letter-spacing:0.8px;text-transform:uppercase;white-space:nowrap}
.sticky-val{font-family:var(--font-display);font-weight:700;font-size:12px;white-space:nowrap}
.sticky-divider{width:1px;height:20px;background:var(--border);flex-shrink:0}
.sticky-actions{margin-left:auto;display:flex;gap:5px;flex-shrink:0}

/* ── Cards / Grid — tighter gaps ── */
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:8px}
.grid-2-1{display:grid;grid-template-columns:1.55fr 1fr;gap:6px;margin-bottom:8px}
.grid-3-1{display:grid;grid-template-columns:2fr 1fr;gap:6px;margin-bottom:8px}

.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;transition:border-color var(--transition),box-shadow var(--transition)}
.card:hover{border-color:var(--border2);box-shadow:var(--shadow)}
.card-sm{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px}
.card-label{font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.card-val{font-family:var(--font-display);font-size:16px;font-weight:700;letter-spacing:-0.3px}
.card-sub{font-size:10px;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:4px}
.card-icon{font-size:18px;margin-bottom:6px;display:block}

/* ── Stat Card ── */
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;transition:all var(--transition);cursor:default;position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;top:0;right:0;width:50px;height:50px;border-radius:0 var(--radius) 0 100%;opacity:0.06}
.stat-card.green::after{background:var(--accent)}
.stat-card.blue::after{background:var(--accent2)}
.stat-card.purple::after{background:var(--accent3)}
.stat-card.red::after{background:var(--danger)}
.stat-card:hover{transform:translateY(-1px);box-shadow:var(--shadow)}

/* ── Balance Banner ── */
.balance-banner{
  background:var(--card);border:1px solid rgba(0,229,160,0.15);
  border-radius:var(--radius-lg);padding:12px 14px;
  margin-bottom:8px;position:relative;overflow:hidden;
}
.balance-banner::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,160,0.06),transparent 70%);pointer-events:none}
.banner-main{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
.balance-label{font-size:8px;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;margin-bottom:2px}
.balance-amount{font-family:var(--font-display);font-size:20px;font-weight:800;letter-spacing:-0.8px;line-height:1}
.balance-amount .curr{font-size:13px;vertical-align:super;color:var(--muted);font-weight:600}
.balance-amount .main-val{color:var(--text)}
.balance-change{margin-top:5px;font-size:10px;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.change-pill{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:600;display:inline-flex;align-items:center;gap:2px}
.change-pill.pos{background:rgba(0,229,160,0.12);color:var(--accent);border:1px solid rgba(0,229,160,0.2)}
.change-pill.neg{background:rgba(255,77,109,0.12);color:var(--danger);border:1px solid rgba(255,77,109,0.2)}
.banner-stats{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.bs-item{padding:6px 10px;background:var(--surface2);border-radius:6px;border:1px solid var(--border);text-align:center;min-width:64px}
.bs-label{font-size:7px;letter-spacing:0.8px;text-transform:uppercase;color:var(--muted);margin-bottom:1px}
.bs-val{font-family:var(--font-display);font-size:12px;font-weight:700}

/* ── Charts ── */
.chart-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px}
.chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.chart-title{font-family:var(--font-display);font-weight:700;font-size:11px}
.chart-sub{font-size:9px;color:var(--muted);margin-top:1px}
.time-tabs{display:flex;gap:2px;background:var(--surface2);border-radius:6px;padding:2px;border:1px solid var(--border)}
.time-tab{padding:3px 8px;border-radius:4px;font-size:9px;cursor:pointer;color:var(--muted);transition:all 0.15s;letter-spacing:0.3px;font-family:var(--font-mono)}
.time-tab.active{background:var(--card);color:var(--accent);font-weight:600}

/* ── Stock Table ── */
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.table-wrap::-webkit-scrollbar{height:3px}
.table-wrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2)}
.stock-table{width:100%;border-collapse:collapse}
.stock-table th{text-align:left;font-size:8px;letter-spacing:0.8px;text-transform:uppercase;color:var(--muted);padding:0 6px 5px;font-weight:400;white-space:nowrap;cursor:pointer;user-select:none}
.stock-table th:hover{color:var(--text2)}
.stock-table td{padding:5px 6px;font-size:11px;border-top:1px solid var(--border);white-space:nowrap;vertical-align:middle}
.stock-table tr{transition:background var(--transition)}
.stock-table tbody tr:hover td{background:rgba(255,255,255,0.02)}
.stock-table td:last-child,.stock-table th:last-child{text-align:right}

.sym-cell{display:flex;align-items:center;gap:8px}
.sym-badge{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:8px;flex-shrink:0}
.sym-text{font-family:var(--font-display);font-weight:700;font-size:12px}
.sym-name{font-size:9px;color:var(--muted);margin-top:1px}
.price-cell{font-family:var(--font-display);font-weight:600;font-size:12px;transition:color 0.3s}
.price-cell.flashing-up{color:var(--accent)!important;animation:flashGreen 0.6s ease}
.price-cell.flashing-down{color:var(--danger)!important;animation:flashRed 0.6s ease}

.chg-pill{display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:600;letter-spacing:0.2px;white-space:nowrap}
.chg-pill.pos{background:rgba(0,229,160,0.1);color:var(--accent);border:1px solid rgba(0,229,160,0.2)}
.chg-pill.neg{background:rgba(255,77,109,0.1);color:var(--danger);border:1px solid rgba(255,77,109,0.2)}
.chg-pill.neu{background:rgba(255,255,255,0.04);color:var(--muted);border:1px solid var(--border)}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:none;cursor:pointer;font-family:var(--font-mono);border-radius:6px;transition:all var(--transition);letter-spacing:0.2px;font-weight:500;white-space:nowrap}
.btn-buy{background:rgba(0,229,160,0.1);color:var(--accent);border:1px solid rgba(0,229,160,0.25);padding:5px 10px;font-size:10px;min-width:44px}
.btn-buy:hover{background:rgba(0,229,160,0.2);border-color:rgba(0,229,160,0.4)}
.btn-sell{background:rgba(255,77,109,0.1);color:var(--danger);border:1px solid rgba(255,77,109,0.25);padding:5px 10px;font-size:10px;min-width:44px}
.btn-sell:hover{background:rgba(255,77,109,0.2);border-color:rgba(255,77,109,0.4)}
.btn-primary{padding:10px 18px;font-size:12px;font-family:var(--font-display);font-weight:700;border-radius:6px;cursor:pointer;border:none;transition:all 0.2s;width:100%}
.btn-primary.buy{background:linear-gradient(135deg,#00e5a0,#00b87a);color:#000}
.btn-primary.buy:hover{box-shadow:0 0 24px rgba(0,229,160,0.35);transform:translateY(-1px)}
.btn-primary.sell{background:linear-gradient(135deg,#ff4d6d,#cc2244);color:#fff}
.btn-primary.sell:hover{box-shadow:0 0 24px rgba(255,77,109,0.35);transform:translateY(-1px)}
.btn-ghost{background:var(--surface2);color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:10px;border-radius:6px}
.btn-ghost:hover{border-color:var(--border2);color:var(--text)}
.btn-accent{background:rgba(0,229,160,0.1);color:var(--accent);border:1px solid rgba(0,229,160,0.25);padding:6px 14px;font-size:11px;font-family:var(--font-display);font-weight:600;border-radius:6px}
.btn-accent:hover{background:rgba(0,229,160,0.18)}
.btn-group{display:flex;gap:4px}

/* ── Section Head ── */
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.sec-title{font-family:var(--font-display);font-weight:700;font-size:12px;display:flex;align-items:center;gap:5px}
.sec-link{font-size:10px;color:var(--accent);cursor:pointer;opacity:0.8;display:flex;align-items:center;gap:3px}
.sec-link:hover{opacity:1}

/* ── Trade Modal ── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:300;backdrop-filter:blur(6px);animation:fadeIn 0.18s ease}
.modal{background:var(--surface);border:1px solid rgba(0,229,160,0.18);border-radius:var(--radius-lg);padding:18px;width:370px;max-width:95vw;max-height:92vh;overflow-y:auto;animation:slideUp 0.22s ease;box-shadow:0 40px 80px rgba(0,0,0,0.6)}
.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.modal-title{font-family:var(--font-display);font-weight:800;font-size:15px}
.modal-close{cursor:pointer;color:var(--muted);font-size:18px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:5px;transition:all var(--transition)}
.modal-close:hover{background:var(--surface2);color:var(--text)}

.stock-info-card{background:var(--surface2);border-radius:6px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border)}
.sic-sym{font-family:var(--font-display);font-weight:800;font-size:16px}
.sic-name{font-size:9px;color:var(--muted);margin-top:1px}
.sic-sector{font-size:8px;color:var(--accent);margin-top:1px;letter-spacing:1px;text-transform:uppercase}
.sic-right{text-align:right}
.sic-price{font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--accent)}
.sic-chg{font-size:9px;margin-top:2px}

.modal-tabs{display:flex;gap:5px;margin-bottom:12px}
.modal-tab{flex:1;padding:8px;border-radius:6px;text-align:center;cursor:pointer;font-size:11px;font-family:var(--font-display);font-weight:700;border:1px solid var(--border);color:var(--muted);transition:all 0.18s}
.modal-tab.buy.active{background:rgba(0,229,160,0.1);color:var(--accent);border-color:rgba(0,229,160,0.3)}
.modal-tab.sell.active{background:rgba(255,77,109,0.1);color:var(--danger);border-color:rgba(255,77,109,0.3)}
.modal-tab.limit.active{background:rgba(0,112,243,0.1);color:var(--accent2);border-color:rgba(0,112,243,0.3)}
.modal-tab.stoploss.active{background:rgba(245,166,35,0.1);color:var(--warn);border-color:rgba(245,166,35,0.3)}

.form-group{margin-bottom:9px}
.form-label{font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;display:block}
.form-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px 11px;color:var(--text);font-family:var(--font-mono);font-size:12px;outline:none;transition:border-color 0.2s,box-shadow 0.2s}
.form-input:focus{border-color:rgba(0,229,160,0.4);box-shadow:0 0 0 2px rgba(0,229,160,0.05)}
.form-input[readonly]{opacity:0.6;cursor:default}
.form-hint{font-size:9px;color:var(--muted);margin-top:2px}
.order-type-tabs{display:flex;gap:3px;margin-bottom:12px}
.ot-tab{flex:1;padding:6px;border-radius:5px;text-align:center;font-size:9px;cursor:pointer;border:1px solid var(--border);color:var(--muted);transition:all 0.15s;font-family:var(--font-mono)}
.ot-tab.active{border-color:rgba(0,112,243,0.4);color:var(--accent2);background:rgba(0,112,243,0.06)}

.order-summary{background:var(--bg);border-radius:6px;padding:9px 11px;margin-bottom:9px;border:1px solid var(--border)}
.os-row{display:flex;justify-content:space-between;align-items:center;font-size:10px;margin-bottom:5px}
.os-row:last-child{margin-bottom:0;border-top:1px solid var(--border);padding-top:7px;font-family:var(--font-display);font-weight:700;font-size:12px}
.os-label{color:var(--muted)}

/* ── Skeleton ── */
.skeleton{background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;border-radius:4px}
.skeleton-text{height:11px;margin-bottom:7px}
.skeleton-title{height:18px;margin-bottom:8px;width:60%}
.skeleton-price{height:28px;width:40%;margin-bottom:7px}
.skeleton-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px}

/* ── Toast ── */
.toast-container{position:fixed;top:14px;right:14px;z-index:500;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.toast{
  display:flex;align-items:center;gap:8px;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:6px;padding:10px 14px;
  box-shadow:0 8px 32px rgba(0,0,0,0.4);
  pointer-events:all;min-width:260px;max-width:340px;
  animation:toastIn 0.3s ease forwards;
}
.toast.leaving{animation:toastOut 0.3s ease forwards}
.toast.success{border-color:rgba(0,229,160,0.3)}
.toast.error{border-color:rgba(255,77,109,0.3)}
.toast.info{border-color:rgba(56,189,248,0.3)}
.toast.warn{border-color:rgba(245,166,35,0.3)}
.toast-icon{font-size:16px;flex-shrink:0}
.toast-body{flex:1}
.toast-title{font-family:var(--font-display);font-weight:700;font-size:11px}
.toast-msg{font-size:10px;color:var(--text2);margin-top:1px}
.toast-close{color:var(--muted);cursor:pointer;font-size:13px;flex-shrink:0}

/* ── Portfolio Items ── */
.port-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.port-item:last-child{border-bottom:none}
.port-badge{width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:10px;flex-shrink:0}
.port-info{flex:1}
.port-sym{font-family:var(--font-display);font-weight:700;font-size:12px}
.port-meta{font-size:9px;color:var(--muted);margin-top:1px}
.port-val{text-align:right}
.port-price{font-family:var(--font-display);font-weight:600;font-size:12px}
.port-gain{font-size:9px;margin-top:2px}
.progress-bar{height:3px;background:var(--surface2);border-radius:2px;margin-top:5px;overflow:hidden}
.progress-fill{height:100%;border-radius:2px;transition:width 0.6s ease}

/* ── Watchlist ── */
.watch-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background var(--transition);margin-bottom:2px}
.watch-row:hover{background:rgba(255,255,255,0.03)}
.watch-sym{font-family:var(--font-display);font-weight:700;font-size:11px;flex:1}
.watch-name{font-size:9px;color:var(--muted)}

/* ── Leaderboard ── */
.lb-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;margin-bottom:3px;transition:background var(--transition)}
.lb-item:hover{background:rgba(255,255,255,0.02)}
.lb-rank{font-family:var(--font-display);font-weight:800;font-size:14px;width:24px;text-align:center;flex-shrink:0}
.lb-rank.gold{color:#ffd700}
.lb-rank.silver{color:#c0c0c0}
.lb-rank.bronze{color:#cd7f32}
.lb-info{flex:1}
.lb-name{font-family:var(--font-display);font-weight:600;font-size:11px}
.lb-trades{font-size:9px;color:var(--muted);margin-top:1px}
.lb-return{font-family:var(--font-display);font-weight:700;font-size:12px}

/* ── Badges ── */
.badges-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.badge-item{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 10px;text-align:center;transition:all var(--transition);cursor:default}
.badge-item.earned{border-color:rgba(0,229,160,0.25);background:rgba(0,229,160,0.04)}
.badge-item.earned:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,229,160,0.12)}
.badge-icon{font-size:22px;margin-bottom:5px;display:block}
.badge-name{font-family:var(--font-display);font-weight:700;font-size:10px;margin-bottom:2px}
.badge-desc{font-size:8px;color:var(--muted);line-height:1.4}
.badge-item.locked{opacity:0.4;filter:grayscale(1)}

/* ── Transactions ── */
.tx-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.tx-row:last-child{border-bottom:none}
.tx-type-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.tx-info{flex:1}
.tx-title{font-family:var(--font-display);font-weight:600;font-size:11px}
.tx-meta{font-size:9px;color:var(--muted);margin-top:1px}
.tx-amount{font-family:var(--font-display);font-weight:700;font-size:12px;text-align:right}
.tx-time{font-size:9px;color:var(--muted);text-align:right;margin-top:1px}

/* ── News ── */
.news-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:opacity var(--transition)}
.news-item:hover{opacity:0.8}
.news-item:last-child{border-bottom:none}
.news-img{width:48px;height:48px;border-radius:6px;background:var(--surface2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid var(--border)}
.news-content{flex:1}
.news-title{font-family:var(--font-display);font-weight:600;font-size:11px;line-height:1.4;margin-bottom:4px}
.news-meta{font-size:9px;color:var(--muted);display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.news-source{color:var(--accent2);font-weight:600}
.news-tag{padding:1px 5px;border-radius:3px;font-size:8px;font-weight:700;background:rgba(0,229,160,0.1);color:var(--accent);border:1px solid rgba(0,229,160,0.2)}

/* ── Wallet ── */
.wallet-card{background:linear-gradient(135deg,#071a12,#061520);border:1px solid rgba(0,229,160,0.18);border-radius:var(--radius-lg);padding:18px 20px;position:relative;overflow:hidden}
.wallet-card::before{content:'';position:absolute;top:-30px;right:-30px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,160,0.08),transparent 70%)}
.wallet-amount{font-family:var(--font-display);font-size:28px;font-weight:800;color:var(--accent);letter-spacing:-1px;margin:6px 0}
.wallet-actions{display:flex;gap:6px;margin-top:12px}
.wallet-btn{flex:1;padding:8px;border-radius:6px;font-size:11px;font-family:var(--font-display);font-weight:700;cursor:pointer;transition:all var(--transition);border:1px solid}
.wallet-btn.add{background:rgba(0,229,160,0.1);color:var(--accent);border-color:rgba(0,229,160,0.25)}
.wallet-btn.add:hover{background:rgba(0,229,160,0.18)}
.wallet-btn.withdraw{background:rgba(255,77,109,0.1);color:var(--danger);border-color:rgba(255,77,109,0.25)}
.wallet-btn.withdraw:hover{background:rgba(255,77,109,0.18)}

/* ── Live dot ── */
.live-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--accent);animation:pulse 1.5s infinite;margin-right:3px;vertical-align:middle}
.live-label{font-size:9px;color:var(--muted);display:flex;align-items:center;gap:3px}

/* ── Filters/Tabs ── */
.page-tabs{display:flex;gap:2px;background:var(--surface2);border-radius:6px;padding:2px;border:1px solid var(--border);width:fit-content;margin-bottom:14px}
.page-tab{padding:5px 12px;border-radius:5px;font-size:10px;font-family:var(--font-display);font-weight:600;cursor:pointer;color:var(--muted);transition:all 0.18s}
.page-tab.active{background:var(--card);color:var(--text);box-shadow:0 1px 6px rgba(0,0,0,0.2)}

/* ── Auth ── */
.auth-page{min-height:100vh;display:flex;background:var(--bg)}
.auth-left{flex:1;background:linear-gradient(160deg,#071510 0%,#05101a 50%,#070b14 100%);display:flex;flex-direction:column;justify-content:center;padding:50px;position:relative;overflow:hidden;border-right:1px solid var(--border)}
.auth-glow1{position:absolute;top:-80px;left:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,160,0.06),transparent 70%);pointer-events:none}
.auth-glow2{position:absolute;bottom:-100px;right:-60px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(0,112,243,0.05),transparent 70%);pointer-events:none}
.auth-tagline{font-family:var(--font-serif);font-style:italic;font-size:38px;line-height:1.18;color:var(--text);margin-bottom:12px;position:relative;z-index:1}
.auth-tagline em{color:var(--accent);font-style:normal}
.auth-desc{font-size:11px;color:var(--muted);max-width:320px;line-height:1.8;position:relative;z-index:1;margin-bottom:24px}
.auth-features{display:flex;flex-direction:column;gap:8px;position:relative;z-index:1}
.auth-feat{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text2)}
.feat-check{width:16px;height:16px;border-radius:50%;background:rgba(0,229,160,0.12);border:1px solid rgba(0,229,160,0.25);display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--accent);flex-shrink:0}
.auth-preview{margin-top:24px;padding:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--radius);position:relative;z-index:1}
.auth-preview-label{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.auth-preview-stat{display:inline-flex;gap:14px}
.aps-val{font-family:var(--font-display);font-weight:700;font-size:16px}
.aps-label{font-size:8px;color:var(--muted);margin-top:1px}

.auth-right{width:440px;display:flex;align-items:center;justify-content:center;padding:32px}
.auth-box{width:100%}
.auth-logo-row{display:flex;align-items:center;gap:9px;margin-bottom:22px}
.auth-title{font-family:var(--font-display);font-weight:800;font-size:20px;margin-bottom:3px}
.auth-subtitle{font-size:11px;color:var(--muted);margin-bottom:20px}
.auth-toggle{display:flex;background:var(--surface2);border-radius:6px;padding:3px;border:1px solid var(--border);margin-bottom:18px}
.auth-toggle-btn{flex:1;padding:7px;text-align:center;border-radius:5px;font-size:11px;font-family:var(--font-display);font-weight:600;cursor:pointer;transition:all 0.2s;color:var(--muted)}
.auth-toggle-btn.active{background:var(--card);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.auth-divider{text-align:center;font-size:10px;color:var(--muted);margin:12px 0;position:relative}
.auth-divider::before,.auth-divider::after{content:'';position:absolute;top:50%;width:40%;height:1px;background:var(--border)}
.auth-divider::before{left:0}
.auth-divider::after{right:0}
.social-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:9px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;font-size:11px;font-family:var(--font-display);font-weight:600;transition:all var(--transition);color:var(--text);margin-bottom:5px}
.social-btn:hover{border-color:var(--border2)}
.forgot-link{text-align:right;font-size:10px;color:var(--accent);cursor:pointer;margin-top:-6px;margin-bottom:12px;opacity:0.85}
.forgot-link:hover{opacity:1}

/* ── Admin ── */
.admin-badge{background:rgba(245,166,35,0.12);color:var(--warn);border:1px solid rgba(245,166,35,0.25);border-radius:3px;font-size:8px;padding:1px 6px;letter-spacing:0.8px;text-transform:uppercase;font-weight:700}

/* ── Empty states ── */
.empty-state{text-align:center;padding:36px 20px;color:var(--muted)}
.empty-icon{font-size:32px;margin-bottom:8px;opacity:0.5}
.empty-text{font-size:11px;line-height:1.6}

/* ── Spinner ── */
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite}

/* ── Gainers/Losers ── */
.gl-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;transition:background var(--transition);cursor:pointer}
.gl-item:hover{background:rgba(255,255,255,0.03)}
.gl-rank{font-size:10px;color:var(--muted);width:16px;text-align:right;flex-shrink:0}
.gl-sym{font-family:var(--font-display);font-weight:700;font-size:11px;flex:1}
.gl-price{font-size:10px;font-family:var(--font-display)}

/* ── Stock Detail Modal ── */
.stock-detail-modal{background:var(--surface);border:1px solid rgba(0,229,160,0.15);border-radius:var(--radius-lg);padding:0;width:520px;max-width:96vw;max-height:92vh;overflow-y:auto;animation:slideUp 0.22s ease}
.sdm-header{background:linear-gradient(135deg,var(--surface2),var(--surface3));padding:18px 22px 14px;border-bottom:1px solid var(--border)}
.sdm-sym{font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:2px}
.sdm-name{color:var(--text2);font-size:11px}
.sdm-price{font-family:var(--font-display);font-size:26px;font-weight:800;margin:8px 0 4px}
.sdm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 22px;border-bottom:1px solid var(--border)}
.sdm-stat{background:var(--surface2);border-radius:7px;padding:8px 10px}
.sdm-stat-label{font-size:9px;color:var(--muted);margin-bottom:3px}
.sdm-stat-val{font-family:var(--font-display);font-weight:700;font-size:13px}
.sdm-actions{display:flex;gap:8px;padding:14px 22px;border-top:1px solid var(--border)}

.connection-banner{background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.25);border-radius:8px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-size:11px;color:var(--danger);animation:slideDown 0.3s ease}

/* ── PnL card ── */
.pnl-card{background:linear-gradient(135deg,rgba(0,229,160,0.06),rgba(0,112,243,0.04));border:1px solid rgba(0,229,160,0.12);border-radius:var(--radius);padding:12px 16px;margin-bottom:10px}
.stat-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:11px}
.stat-row:last-child{border-bottom:none}
.stat-row-label{color:var(--muted)}
.stat-row-val{font-family:var(--font-display);font-weight:700}

/* ── Sector colors ── */
.sector-tech{color:#38bdf8}.sector-auto{color:#f472b6}.sector-finance{color:#a78bfa}.sector-energy{color:#fb923c}.sector-health{color:#4ade80}

/* ── RESPONSIVE BREAKPOINTS ── */

/* Large desktop: grid-4 stays 4 cols */
@media(min-width:1400px){
  :root{--sidebar-w:160px}
  html{font-size:14px}
  .grid-4{grid-template-columns:repeat(4,1fr)}
  .search-wrap{width:200px}
}

/* Standard desktop 1024–1399px */
@media(max-width:1399px){
  :root{--sidebar-w:148px}
  .grid-4{grid-template-columns:repeat(4,1fr);gap:5px}
  .grid-3{grid-template-columns:repeat(3,1fr);gap:5px}
  .banner-stats{display:flex}
}

/* Compact desktop / laptop 900–1199px */
@media(max-width:1199px){
  :root{--sidebar-w:140px}
  html{font-size:12px}
  .grid-4{grid-template-columns:repeat(2,1fr);gap:5px}
  .grid-3{grid-template-columns:repeat(3,1fr);gap:5px}
  .grid-2-1{grid-template-columns:1.4fr 1fr;gap:5px}
  .grid-3-1{grid-template-columns:1.8fr 1fr;gap:5px}
  .balance-amount{font-size:18px}
  .bs-item{min-width:56px;padding:5px 8px}
  .bs-val{font-size:11px}
  .search-wrap{width:140px}
  .content{padding:7px 9px}
  .badges-grid{grid-template-columns:repeat(4,1fr)}
}

/* Small laptop 768–899px */
@media(max-width:899px){
  :root{--sidebar-w:130px}
  html{font-size:11.5px}
  .grid-4{grid-template-columns:repeat(2,1fr)}
  .grid-3{grid-template-columns:repeat(2,1fr)}
  .grid-2-1{grid-template-columns:1fr}
  .grid-3-1{grid-template-columns:1fr}
  .grid-2{grid-template-columns:1fr}
  .banner-stats{display:none}
  .balance-amount{font-size:17px}
  .content{padding:6px 8px}
  .search-wrap{width:120px}
  .badges-grid{grid-template-columns:repeat(2,1fr)}
}

/* Tablet */
@media(max-width:700px){
  .sidebar{transform:translateX(-200px)}
  .main{margin-left:0}
  .auth-left{display:none}
  .auth-right{width:100%}
  .content{padding:8px}
  .grid-3,.grid-2,.grid-4{grid-template-columns:1fr}
  .search-wrap{display:none}
  .sticky-bar{overflow-x:auto}
  .btn-buy,.btn-sell{padding:4px 8px;font-size:9px;min-width:auto}
  .badges-grid{grid-template-columns:repeat(2,1fr)}
}
`;

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const STOCKS_DATA = [
  { sym:"AAPL", name:"Apple Inc.", price:189.84, chg:+1.24, chgP:+0.66, sector:"Tech", spark:[182,184,181,186,185,188,187,190], color:"#00e5a0", bg:"rgba(0,229,160,0.1)", cap:"2.94T", vol:"62.1M" },
  { sym:"TSLA", name:"Tesla Inc.", price:248.42, chg:-5.31, chgP:-2.09, sector:"Auto", spark:[260,255,258,252,256,250,253,248], color:"#ff4d6d", bg:"rgba(255,77,109,0.1)", cap:"789B", vol:"98.4M" },
  { sym:"MSFT", name:"Microsoft Corp.", price:378.91, chg:+3.12, chgP:+0.83, sector:"Tech", spark:[372,374,373,376,375,377,376,379], color:"#00e5a0", bg:"rgba(0,112,243,0.1)", cap:"2.81T", vol:"22.3M" },
  { sym:"GOOGL", name:"Alphabet Inc.", price:142.56, chg:+0.87, chgP:+0.61, sector:"Tech", spark:[139,140,141,140,142,141,143,143], color:"#00e5a0", bg:"rgba(56,189,248,0.1)", cap:"1.78T", vol:"18.6M" },
  { sym:"NVDA", name:"NVIDIA Corp.", price:875.40, chg:+18.60, chgP:+2.17, sector:"Tech", spark:[840,845,855,850,860,858,868,875], color:"#00e5a0", bg:"rgba(124,58,237,0.1)", cap:"2.16T", vol:"44.7M" },
  { sym:"AMZN", name:"Amazon.com", price:185.73, chg:-2.14, chgP:-1.14, sector:"Tech", spark:[190,188,189,187,186,187,186,186], color:"#ff4d6d", bg:"rgba(251,146,60,0.1)", cap:"1.92T", vol:"33.8M" },
  { sym:"JPM",  name:"JPMorgan Chase", price:198.30, chg:-0.45, chgP:-0.23, sector:"Finance", spark:[200,199,200,199,198,199,198,198], color:"#ff4d6d", bg:"rgba(167,139,250,0.1)", cap:"572B", vol:"9.1M" },
  { sym:"META", name:"Meta Platforms", price:486.50, chg:+6.20, chgP:+1.29, sector:"Tech", spark:[479,481,484,482,486,484,487,487], color:"#00e5a0", bg:"rgba(0,112,243,0.1)", cap:"1.24T", vol:"14.2M" },
];

const PORTFOLIO_DATA = [
  { sym:"AAPL", name:"Apple Inc.", shares:12, avgPrice:178.50, current:189.84, sector:"Tech", color:"#00e5a0", bg:"rgba(0,229,160,0.12)" },
  { sym:"NVDA", name:"NVIDIA Corp.", shares:3,  avgPrice:820.00, current:875.40, sector:"Tech", color:"#7c3aed", bg:"rgba(124,58,237,0.12)" },
  { sym:"MSFT", name:"Microsoft Corp.", shares:8,  avgPrice:365.00, current:378.91, sector:"Tech", color:"#0070f3", bg:"rgba(0,112,243,0.12)" },
  { sym:"TSLA", name:"Tesla Inc.", shares:5,  avgPrice:265.00, current:248.42, sector:"Auto", color:"#ff4d6d", bg:"rgba(255,77,109,0.12)" },
];

const TRANSACTIONS_DATA = [
  { type:"BUY",  sym:"NVDA", qty:2, price:858.00, time:"2h ago",  orderType:"Market" },
  { type:"SELL", sym:"META", qty:10, price:486.50, time:"5h ago", orderType:"Limit" },
  { type:"BUY",  sym:"AAPL", qty:5, price:185.20, time:"1d ago", orderType:"Market" },
  { type:"SELL", sym:"MSFT", qty:3, price:372.10, time:"2d ago", orderType:"Stop-Loss" },
  { type:"BUY",  sym:"TSLA", qty:2, price:270.00, time:"3d ago", orderType:"Market" },
];

const LEADERBOARD_DATA = [
  { name:"Arjun S.", trades:87, returnPct:+34.2, initVal:100000, avatar:"AS" },
  { name:"Priya M.", trades:64, returnPct:+28.7, initVal:100000, avatar:"PM" },
  { name:"John Smith", trades:52, returnPct:+27.8, initVal:100000, avatar:"JS", isMe:true },
  { name:"Riya K.", trades:41, returnPct:+19.1, initVal:100000, avatar:"RK" },
  { name:"Dev P.", trades:33, returnPct:+12.4, initVal:100000, avatar:"DP" },
];

const BADGES_DATA = [
  { icon:"🚀", name:"First Trade", desc:"Placed your first order", earned:true },
  { icon:"💎", name:"Diamond Hands", desc:"Hold a stock for 30 days", earned:true },
  { icon:"📈", name:"Bull Run", desc:"10 profitable trades", earned:true },
  { icon:"🎯", name:"Sharpshooter", desc:"5% portfolio growth", earned:true },
  { icon:"⚡", name:"Day Trader", desc:"5 trades in one day", earned:false },
  { icon:"🏆", name:"Top 10", desc:"Reach top 10 leaderboard", earned:false },
  { icon:"🧠", name:"Strategist", desc:"Use all order types", earned:false },
  { icon:"🌟", name:"Star Trader", desc:"50% total return", earned:false },
];

const NEWS_DATA = [
  { emoji:"🤖", title:"NVIDIA surpasses $2T market cap on AI chip demand surge", source:"Reuters", time:"2h ago", tag:"NVDA", sentiment:"pos" },
  { emoji:"🍎", title:"Apple unveils AI-powered MacBook Pro lineup at Spring Event", source:"Bloomberg", time:"4h ago", tag:"AAPL", sentiment:"pos" },
  { emoji:"⚡", title:"Tesla cuts EV prices again amid fierce competition from BYD", source:"WSJ", time:"6h ago", tag:"TSLA", sentiment:"neg" },
  { emoji:"📊", title:"Fed signals rate cuts may come later than markets expect", source:"FT", time:"8h ago", tag:"MACRO", sentiment:"neg" },
  { emoji:"💰", title:"Microsoft Azure revenue jumps 31% on cloud and AI demand", source:"CNBC", time:"1d ago", tag:"MSFT", sentiment:"pos" },
];

const SECTOR_ALLOC = [
  { sector:"Technology", pct:72, color:"#00e5a0" },
  { sector:"Automotive", pct:15, color:"#ff4d6d" },
  { sector:"Finance", pct:8,  color:"#7c3aed" },
  { sector:"Cash", pct:5,  color:"#5a6478" },
];

const CHART_DATA_FULL = {
  "1D":[127100,127300,126800,127500,127200,127800,127400,127842],
  "1W":[124500,124800,124200,125100,124900,125800,126400,127842],
  "1M":[118000,119500,121000,120200,122400,123100,125600,127842],
  "3M":[105000,108000,111000,109000,115000,118000,122000,127842],
  "1Y":[85000,90000,88000,95000,100000,110000,120000,127842],
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Spark({ data, color = "#00e5a0", w = 56, h = 22 }) {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:"block", flexShrink:0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function AreaChart({ data, color = "#00e5a0" }) {
  const W = 600, H = 120;
  const max = Math.max(...data), min = Math.min(...data) * 0.98;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * (H - 8);
    return [x, y];
  });
  const line = pts.map(p => p.join(",")).join(" ");
  const fill = `0,${H} ${pts.map(p => p.join(",")).join(" ")} ${W},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:"100%", height:"100%" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#cg)"/>
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function PieChart({ data }) {
  const total = data.reduce((a, b) => a + b.pct, 0);
  let cumulative = 0;
  const R = 46, CX = 56, CY = 56;
  const slices = data.map(d => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.pct;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(startAngle), y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle),   y2 = CY + R * Math.sin(endAngle);
    const large = d.pct / total > 0.5 ? 1 : 0;
    return { ...d, d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` };
  });
  return (
    <svg viewBox="0 0 112 112" style={{ width:"100px", height:"100px", flexShrink:0 }}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity="0.85" stroke="var(--card)" strokeWidth="1.5"/>)}
      <circle cx={CX} cy={CY} r="24" fill="var(--card)"/>
      <text x={CX} y={CY - 3} textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="Syne,sans-serif" fontWeight="700">PORT</text>
      <text x={CX} y={CY + 8} textAnchor="middle" fill="var(--accent)" fontSize="7" fontFamily="DM Mono,monospace">MIX</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════════ */
let toastId = 0;
const toastListeners = [];
function showToast(type, title, msg) {
  const id = ++toastId;
  toastListeners.forEach(fn => fn({ id, type, title, msg }));
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = t => {
      setToasts(p => [...p, t]);
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3800);
    };
    toastListeners.push(handler);
    return () => { const i = toastListeners.indexOf(handler); if (i>-1) toastListeners.splice(i,1); };
  }, []);
  const icons = { success:"✅", error:"❌", info:"ℹ️", warn:"⚠️" };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.msg && <div className="toast-msg">{t.msg}</div>}
          </div>
          <span className="toast-close" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>✕</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRICE FLASH COMPONENT
═══════════════════════════════════════════════════════════════ */
function FlashPrice({ price, prev }) {
  const [cls, setCls] = useState("");
  const prevRef = useRef(price);
  useEffect(() => {
    if (price !== prevRef.current) {
      setCls(price > prevRef.current ? "flashing-up" : "flashing-down");
      prevRef.current = price;
      const t = setTimeout(() => setCls(""), 700);
      return () => clearTimeout(t);
    }
  }, [price]);
  return <span className={`price-cell ${cls}`}>${price.toFixed(2)}</span>;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-price" />
      <div className="skeleton skeleton-text" style={{ width:"70%" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STOCK DETAIL MODAL
═══════════════════════════════════════════════════════════════ */
function StockDetailModal({ stock, onClose, onTrade }) {
  const sym      = stock.sym || stock.symbol || "";
  const name     = stock.name || sym;
  const price    = stock.price || stock.currentPrice || 0;
  const chg      = stock.chg || stock.change || 0;
  const chgP     = stock.chgP || stock.changePercent || 0;
  const cap      = stock.cap || stock.marketCap || "—";
  const vol      = stock.vol || (stock.volume ? (stock.volume/1e6).toFixed(1)+"M" : "—");
  const sector   = stock.sector || "—";
  const spark    = stock.spark || [];
  const isPos = chgP >= 0;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="stock-detail-modal">
        <div className="sdm-header">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div className="sdm-sym">{sym}</div>
              <div className="sdm-name">{name} · {sector}</div>
            </div>
            <div className="modal-close" onClick={onClose}>✕</div>
          </div>
          <div className="sdm-price" style={{ color: isPos ? "var(--accent)" : "var(--danger)" }}>${price.toFixed(2)}</div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span className={`chg-pill ${isPos?"pos":"neg"}`}>{isPos?"▲":"▼"} {isPos?"+":""}{chg.toFixed(2)}</span>
            <span className={`chg-pill ${isPos?"pos":"neg"}`}>{isPos?"+":""}{chgP.toFixed(2)}%</span>
          </div>
          {spark.length > 0 && (
            <div style={{ marginTop:10, height:44 }}>
              <AreaChart data={spark} color={isPos?"#00e5a0":"#ff4d6d"}/>
            </div>
          )}
        </div>
        <div className="sdm-stats">
          <div className="sdm-stat"><div className="sdm-stat-label">Market Cap</div><div className="sdm-stat-val">{cap}</div></div>
          <div className="sdm-stat"><div className="sdm-stat-label">Volume</div><div className="sdm-stat-val">{vol}</div></div>
          <div className="sdm-stat"><div className="sdm-stat-label">Sector</div><div className="sdm-stat-val">{sector}</div></div>
          <div className="sdm-stat"><div className="sdm-stat-label">Day High</div><div className="sdm-stat-val" style={{ color:"var(--accent)" }}>${(price*1.005).toFixed(2)}</div></div>
          <div className="sdm-stat"><div className="sdm-stat-label">Day Low</div><div className="sdm-stat-val" style={{ color:"var(--danger)" }}>${(price*0.995).toFixed(2)}</div></div>
          <div className="sdm-stat"><div className="sdm-stat-label">Prev Close</div><div className="sdm-stat-val">${(price - chg).toFixed(2)}</div></div>
        </div>
        <div className="sdm-actions">
          <button className="btn-primary buy" style={{ flex:1 }} onClick={() => { onClose(); onTrade({ ...stock, price }); }}>🛒 Buy {sym}</button>
          <button className="btn-primary sell" style={{ flex:1 }} onClick={() => { onClose(); onTrade({ ...stock, price }); }}>💸 Sell {sym}</button>
          <button className="btn btn-buy" style={{ minWidth:36 }} onClick={() => { API.addWatchlist(sym).then(()=>showToast("success","Added",sym+" added to watchlist")).catch(e=>showToast("error","Error",e.message)); }}>⭐</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONNECTION STATUS BANNER
═══════════════════════════════════════════════════════════════ */
function ConnectionBanner() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    fetch("http://localhost:5000/health")
      .then(r => r.json())
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);
  if (status !== "error") return null;
  return (
    <div className="connection-banner">
      ⚠️ <strong>Backend not connected.</strong> Make sure the server is running: <code style={{ background:"rgba(255,77,109,0.15)", padding:"1px 5px", borderRadius:3 }}>cd sbstocks-backend && npm run dev</code>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRADE MODAL
═══════════════════════════════════════════════════════════════ */
function TradeModal({ stock, onClose, onOrderPlaced }) {
  const sym       = stock.sym || stock.symbol || "?";
  const stockName = stock.name || sym;
  const rawPrice  = stock.price || stock.current || stock.currentPrice || 0;
  const livePrice = parseFloat(rawPrice) || 0;
  const chg       = stock.chg  || stock.change        || 0;
  const chgP      = stock.chgP || stock.changePercent  || 0;
  const ownedQty  = stock.shares || stock.quantity || 0;

  const [side, setSide]           = useState("buy");
  const [orderType, setOrderType] = useState("market");
  const [qty, setQty]             = useState(1);
  const [limitPrice, setLimitPrice] = useState(livePrice > 0 ? livePrice.toFixed(2) : "0.00");
  const [slPrice, setSlPrice]       = useState(livePrice > 0 ? (livePrice * 0.95).toFixed(2) : "0.00");

  const execPrice = orderType === "market"
    ? livePrice
    : parseFloat(orderType === "stoploss" ? slPrice : limitPrice) || livePrice;
  const total = ((qty || 0) * (execPrice || 0)).toFixed(2);
  const cash  = 100000;

  const [submitting, setSubmitting] = useState(false);
  const [tradeError, setTradeError] = useState("");

  async function handleSubmit() {
    if (!livePrice || livePrice <= 0) { setTradeError("Price data unavailable"); return; }
    setTradeError(""); setSubmitting(true);
    try {
      const body = { symbol: sym, side, orderType, quantity: qty };
      if (orderType === "limit")    body.limitPrice = parseFloat(limitPrice);
      if (orderType === "stoploss") body.stopPrice  = parseFloat(slPrice);
      await API.placeOrder(body);
      showToast("success", `${side==="buy"?"Buy":"Sell"} Order Placed ✅`,
        `${orderType === "limit" ? "Limit" : orderType === "stoploss" ? "Stop-Loss" : "Market"}: ${qty} × ${sym} @ $${(execPrice||0).toFixed(2)}`);
      if (onOrderPlaced) onOrderPlaced();
      onClose();
    } catch(err) {
      setTradeError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">Place Order</div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>
        <div className="stock-info-card">
          <div className="sic-left">
            <div className="sic-sym">{sym}</div>
            <div className="sic-name">{stockName}</div>
            <div className="sic-sector">{stock.sector || ""}</div>
          </div>
          <div className="sic-right">
            <div className="sic-price">${livePrice.toFixed(2)}</div>
            <div className="sic-chg" style={{ color: chg >= 0 ? "var(--accent)" : "var(--danger)" }}>
              {chg >= 0 ? "▲" : "▼"} {Math.abs(chgP).toFixed(2)}% today
            </div>
          </div>
        </div>
        <div className="modal-tabs">
          <div className={`modal-tab buy ${side==="buy"?"active":""}`} onClick={() => setSide("buy")}>📈 BUY</div>
          <div className={`modal-tab sell ${side==="sell"?"active":""}`} onClick={() => setSide("sell")}>📉 SELL</div>
        </div>
        <div className="form-group">
          <label className="form-label">Order Type</label>
          <div className="order-type-tabs">
            {[["market","Market"],["limit","Limit"],["stoploss","Stop-Loss"]].map(([v,l]) => (
              <div key={v} className={`ot-tab ${orderType===v?"active":""}`} onClick={() => setOrderType(v)}>{l}</div>
            ))}
          </div>
          {orderType === "market" && <div className="form-hint">Executes immediately at current market price</div>}
          {orderType === "limit"  && <div className="form-hint">Executes only when price reaches your target</div>}
          {orderType === "stoploss" && <div className="form-hint">Auto-sells if price drops below your stop price</div>}
        </div>
        {orderType === "limit" && (
          <div className="form-group">
            <label className="form-label">Limit Price ($)</label>
            <input className="form-input" type="number" step="0.01" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} />
          </div>
        )}
        {orderType === "stoploss" && (
          <div className="form-group">
            <label className="form-label">Stop-Loss Price ($)</label>
            <input className="form-input" type="number" step="0.01" value={slPrice} onChange={e => setSlPrice(e.target.value)} />
            <div className="form-hint">Auto-sells if price drops below ${slPrice}</div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Quantity (Shares)</label>
          <input className="form-input" type="number" min="1" value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value)||1))} />
          {side === "sell" && <div className="form-hint">You own: {ownedQty} shares of {sym}</div>}
        </div>
        <div className="order-summary">
          <div className="os-row"><span className="os-label">Price per share</span><span>${execPrice.toFixed(2)}</span></div>
          <div className="os-row"><span className="os-label">Quantity</span><span>{qty} shares</span></div>
          <div className="os-row"><span className="os-label">Commission</span><span style={{ color:"var(--accent)" }}>$0.00 (Free)</span></div>
          <div className="os-row">
            <span className="os-label">{side === "buy" ? "Total Cost" : "You'll Receive"}</span>
            <span style={{ color: side==="buy" ? "var(--accent)" : "var(--danger)" }}>${total}</span>
          </div>
        </div>
        {side === "buy" && (
          <div style={{ fontSize:10, color:"var(--muted)", marginBottom:10, textAlign:"right" }}>
            Available cash: <span style={{ color:"var(--accent)", fontFamily:"var(--font-display)", fontWeight:700 }}>${cash.toLocaleString()}</span>
          </div>
        )}
        {tradeError && <div style={{ background:"rgba(255,77,109,0.1)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:7, padding:"7px 11px", fontSize:10, color:"var(--danger)", marginBottom:9 }}>⚠️ {tradeError}</div>}
        <button className={`btn-primary ${side}`} onClick={handleSubmit} disabled={submitting} style={{ opacity:submitting?0.7:1 }}>
          {submitting ? <span className="spinner" style={{ margin:"0 auto" }}/> : (side === "buy" ? `🛒 Buy ${qty} share${qty>1?"s":""} · $${total}` : `💸 Sell ${qty} share${qty>1?"s":""} · $${total}`)}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WALLET MODAL
═══════════════════════════════════════════════════════════════ */
function WalletModal({ onClose }) {
  const [tab, setTab] = useState("add");
  const [amount, setAmount] = useState("10000");
  const [method, setMethod] = useState("upi");
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">{tab === "add" ? "Add Funds" : "Withdraw Funds"}</div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>
        <div className="modal-tabs">
          <div className={`modal-tab buy ${tab==="add"?"active":""}`} onClick={() => setTab("add")}>💳 Add Money</div>
          <div className={`modal-tab sell ${tab==="withdraw"?"active":""}`} onClick={() => setTab("withdraw")}>🏦 Withdraw</div>
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹ Simulated)</label>
          <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <div style={{ display:"flex", gap:5, marginTop:5 }}>
            {[5000,10000,25000,50000].map(a => (
              <button key={a} className="btn-ghost" style={{ flex:1, padding:"4px 6px", fontSize:9 }} onClick={() => setAmount(String(a))}>
                +{(a/1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>
        {tab === "add" && (
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div className="order-type-tabs">
              {[["upi","UPI"],["card","Card"],["netbanking","Net Banking"]].map(([v,l]) => <div key={v} className={`ot-tab ${method===v?"active":""}`} onClick={() => setMethod(v)}>{l}</div>)}
            </div>
          </div>
        )}
        <div className="order-summary">
          <div className="os-row"><span className="os-label">Amount</span><span>₹{parseInt(amount||0).toLocaleString()}</span></div>
          <div className="os-row"><span className="os-label">Virtual Credits</span><span style={{ color:"var(--accent)" }}>${parseInt(amount||0).toLocaleString()}</span></div>
          <div className="os-row"><span className="os-label">New Balance</span><span style={{ fontFamily:"var(--font-display)", fontWeight:700 }}>${(47215.64 + parseInt(amount||0)).toLocaleString()}</span></div>
        </div>
        <button className={`btn-primary ${tab==="add"?"buy":"sell"}`} onClick={() => {
          showToast("success", tab==="add"?"Funds Added!":"Withdrawal Initiated",
            `$${parseInt(amount).toLocaleString()} ${tab==="add"?"added to":"withdrawn from"} your virtual wallet`);
          onClose();
        }}>
          {tab === "add" ? `Add $${parseInt(amount||0).toLocaleString()} →` : `Withdraw $${parseInt(amount||0).toLocaleString()} →`}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TICKER TAPE
═══════════════════════════════════════════════════════════════ */
function TickerTape({ prices }) {
  const items = [...STOCKS_DATA, ...STOCKS_DATA];
  return (
    <div className="ticker-tape">
      <div className="ticker-inner">
        {items.map((s, i) => {
          const live = prices[s.sym] ?? s.price;
          const pos = (prices[s.sym] ? prices[s.sym] >= s.price : s.chg >= 0);
          return (
            <span key={i} className="tick-item">
              <span className="tick-sym">{s.sym}</span>
              <span className="tick-price">${live.toFixed(2)}</span>
              <span className="tick-chg" style={{ color: pos ? "var(--accent)" : "var(--danger)" }}>
                {pos ? "▲" : "▼"}{Math.abs(s.chgP).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════════════════ */
function SearchBar({ onTrade }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = q.length > 0 ? STOCKS_DATA.filter(s =>
    s.sym.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 5) : [];
  return (
    <div className="search-wrap">
      <div className="search-box">
        <span style={{ color:"var(--muted)", fontSize:13 }}>⌕</span>
        <input placeholder="Search stocks, symbols..."
          value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)} onFocus={() => setOpen(true)} />
      </div>
      {open && filtered.length > 0 && (
        <div className="search-results">
          {filtered.map(s => (
            <div key={s.sym} className="search-result-item" onMouseDown={() => { setQ(""); setOpen(false); onTrade(s); }}>
              <div className="sri-sym">{s.sym}</div>
              <div className="sri-name">{s.name}</div>
              <div className="sri-price" style={{ color: s.chg >= 0 ? "var(--accent)" : "var(--danger)" }}>${s.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const [mode, setMode]     = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const t = localStorage.getItem("sb_token");
    if (t) { setToken(t); API.getMe().then(d => onLogin(d.data)).catch(() => setToken(null)); }
  }, []);

  useEffect(() => {
    if (!pass) { setStrength(0); return; }
    let s = 0;
    if (pass.length >= 6)  s++;
    if (pass.length >= 10) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    setStrength(s);
  }, [pass]);

  async function handleSubmit() {
    if (!email || !pass) { setError("Please fill all fields"); return; }
    if (mode === "register" && !name) { setError("Please enter your name"); return; }
    setError(""); setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await API.login(email, pass);
      } else {
        data = await API.register(name, email, pass);
      }
      setToken(data.accessToken);
      showToast("success", mode === "login" ? "Welcome back! 👋" : "Account created! 🎉", "You're signed in to SB Stocks");
      onLogin(data.user);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) { if (e.key === "Enter") handleSubmit(); }

  const strengthColors = ["","#ff4d6d","#f5a623","#0070f3","#00e5a0","#00e5a0"];
  const strengthLabels = ["","Weak","Fair","Good","Strong","Very Strong"];
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-glow1"/><div className="auth-glow2"/>
        <div className="auth-logo-row">
          <div className="logo-mark">SB</div>
          <div><div className="logo-text">SB <span>Stocks</span></div><div className="logo-sub">PAPER TRADING PLATFORM</div></div>
        </div>
        <div className="auth-tagline">Trade smarter,<br/>learn <em>faster</em>,<br/>risk <em>nothing.</em></div>
        <div className="auth-desc">Master the markets with virtual money. Real data, real strategies, zero financial risk. Join 12,000+ traders already practicing on SB Stocks.</div>
        <div className="auth-features">
          {["Real-time US market data via WebSocket","Virtual $1,00,000 starting balance","Limit orders, stop-loss & partial sells","Portfolio analytics with Chart.js","Leaderboard, badges & achievements","News feed & sector analysis"].map(f => (
            <div key={f} className="auth-feat"><div className="feat-check">✓</div>{f}</div>
          ))}
        </div>
        <div className="auth-preview">
          <div className="auth-preview-label">Platform Stats</div>
          <div className="auth-preview-stat">
            <div className="aps-item"><div className="aps-val" style={{ color:"var(--accent)" }}>12K+</div><div className="aps-label">Traders</div></div>
            <div className="aps-item"><div className="aps-val">$4.2M</div><div className="aps-label">Vol / day</div></div>
            <div className="aps-item"><div className="aps-val" style={{ color:"var(--accent)" }}>128</div><div className="aps-label">Stocks</div></div>
            <div className="aps-item"><div className="aps-val">Free</div><div className="aps-label">Always</div></div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo-row">
            <div className="logo-mark">SB</div>
            <div className="logo-text">SB <span>Stocks</span></div>
          </div>
          <div className="auth-title">{mode === "login" ? "Welcome back 👋" : "Start Trading Free"}</div>
          <div className="auth-subtitle">{mode === "login" ? "Sign in to your account" : "Create your paper trading account"}</div>
          <div className="auth-toggle">
            <div className={`auth-toggle-btn ${mode==="login"?"active":""}`} onClick={() => setMode("login")}>Sign In</div>
            <div className={`auth-toggle-btn ${mode==="register"?"active":""}`} onClick={() => setMode("register")}>Register</div>
          </div>
          {error && (
            <div style={{ background:"rgba(255,77,109,0.1)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:7, padding:"9px 12px", fontSize:11, color:"var(--danger)", marginBottom:10, display:"flex", alignItems:"center", gap:7 }}>
              ⚠️ {error}
            </div>
          )}
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey} autoFocus/>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} autoFocus={mode==="login"}/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:"relative" }}>
              <input className="form-input" type={showPass?"text":"password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={handleKey} style={{ paddingRight:38 }}/>
              <span onClick={() => setShowPass(p=>!p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"var(--muted)", fontSize:13, userSelect:"none" }}>{showPass?"🙈":"👁️"}</span>
            </div>
            {mode === "register" && pass.length > 0 && (
              <div style={{ marginTop:5 }}>
                <div style={{ display:"flex", gap:3, marginBottom:3 }}>
                  {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=strength ? strengthColors[strength] : "var(--border)", transition:"all 0.3s" }}/>)}
                </div>
                <div style={{ fontSize:9, color: strengthColors[strength] }}>{strengthLabels[strength]}</div>
              </div>
            )}
          </div>
          {mode === "login" && <div className="forgot-link">Forgot password?</div>}
          <button className="btn-primary buy" onClick={handleSubmit} disabled={loading} style={{ marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:7, opacity: loading?0.7:1 }}>
            {loading ? <><span className="spinner"/> {mode==="login"?"Signing in...":"Creating account..."}</> : (mode === "login" ? "Sign In →" : "Create Account →")}
          </button>
          {mode === "register" && (
            <div style={{ textAlign:"center", fontSize:10, color:"var(--muted)", marginBottom:6 }}>
              Start with $100,000 virtual cash
            </div>
          )}
          <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"var(--muted)" }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <span style={{ color:"var(--accent)", cursor:"pointer" }} onClick={() => setMode(mode==="login"?"register":"login")}>
              {mode === "login" ? "Register free →" : "Sign in →"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════════ */
function Dashboard({ onTrade, prices, loading, stocks, portfolio, user, transactions }) {
  const [chartTab, setChartTab] = useState("1W");
  const sArr = (stocks && stocks.length > 0) ? stocks : STOCKS_DATA;
  const gainers = [...sArr].sort((a,b) => b.chgP - a.chgP).slice(0, 4);
  const losers  = [...sArr].sort((a,b) => a.chgP - b.chgP).slice(0, 4);
  if (loading) return (
    <>
      <div className="grid-4">{[1,2,3,4].map(i => <SkeletonCard key={i}/>)}</div>
      <div className="grid-2">{[1,2].map(i => <SkeletonCard key={i}/>)}</div>
    </>
  );
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      {/* Banner */}
      <div className="balance-banner">
        <div className="banner-main">
          <div>
            <div className="balance-label">Total Portfolio Value</div>
            <div className="balance-amount"><span className="curr">$</span><span className="main-val">127,842</span><span style={{ fontSize:15, color:"var(--muted)" }}>.36</span></div>
            <div className="balance-change">
              <span className="change-pill pos">▲ +$3,241.82</span>
              <span className="change-pill pos">+2.61% today</span>
              <span style={{ fontSize:9, color:"var(--muted)", display:"flex", alignItems:"center", gap:3 }}><span className="live-dot"/>NSE Open · 09:15 – 15:30</span>
            </div>
          </div>
          <div className="banner-stats">
            {[
              { label:"Cash Available", val:"$47,215", color:"var(--accent)" },
              { label:"Invested", val:"$80,626" },
              { label:"All-Time Return", val:"+27.84%", color:"var(--accent)" },
              { label:"Today's P&L", val:"+$3,241", color:"var(--accent)" },
            ].map(s => (
              <div key={s.label} className="bs-item">
                <div className="bs-label">{s.label}</div>
                <div className="bs-val" style={{ color: s.color || "var(--text)" }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats — 4 col on desktop */}
      <div className="grid-4">
        {[
          { label:"Open Positions", val:"4", sub:"2 profitable", icon:"📂", cls:"blue" },
          { label:"Win Rate", val:"68%", sub:"Last 30 trades", icon:"🎯", cls:"green" },
          { label:"Trades Today", val:"7", sub:"$12,450 volume", icon:"⚡", cls:"purple" },
          { label:"Pending Orders", val:"3", sub:"Limit & SL active", icon:"⏳", cls:"red" },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <span className="card-icon">{s.icon}</span>
            <div className="card-label">{s.label}</div>
            <div className="card-val">{s.val}</div>
            <div className="card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Watchlist */}
      <div className="grid-2-1">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Portfolio Performance</div>
              <div className="chart-sub live-label"><span className="live-dot"/>Live price feed active</div>
            </div>
            <div className="time-tabs">
              {Object.keys(CHART_DATA_FULL).map(t => (
                <div key={t} className={`time-tab ${chartTab===t?"active":""}`} onClick={() => setChartTab(t)}>{t}</div>
              ))}
            </div>
          </div>
          <div style={{ height:130 }}><AreaChart data={CHART_DATA_FULL[chartTab]}/></div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:9, color:"var(--muted)" }}>
            {CHART_DATA_FULL[chartTab].map((_,i) => <span key={i} style={{ opacity: i===0||i===CHART_DATA_FULL[chartTab].length-1?1:0.4 }}>{i===0?"Start":i===CHART_DATA_FULL[chartTab].length-1?"Now":""}</span>)}
          </div>
        </div>

        <div className="card">
          <div className="sec-head">
            <div className="sec-title">Watchlist <span className="live-dot" style={{ width:4, height:4, display:"inline-block" }}/></div>
            <div className="sec-link">+ Add</div>
          </div>
          {((stocks && stocks.length>0) ? stocks : STOCKS_DATA).slice(0,5).map(s => (
            <div key={s.sym} className="watch-row" onClick={() => onTrade(s)}>
              <div>
                <div className="watch-sym">{s.sym}</div>
                <div className="watch-name">{s.sector}</div>
              </div>
              <Spark data={s.spark} color={s.chg >= 0 ? "#00e5a0" : "#ff4d6d"}/>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:11 }}>${(prices[s.sym] ?? s.price).toFixed(2)}</div>
                <div style={{ fontSize:9, color: s.chg>=0?"var(--accent)":"var(--danger)" }}>{s.chg>=0?"▲":"▼"}{Math.abs(s.chgP).toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gainers + Losers + Sector */}
      <div className="grid-3" style={{ marginBottom:16 }}>
        <div className="card">
          <div className="sec-head"><div className="sec-title">🚀 Top Gainers</div></div>
          {gainers.map((s,i) => (
            <div key={s.sym} className="gl-item" onClick={() => onTrade(s)}>
              <div className="gl-rank">{i+1}</div>
              <div style={{ flex:1 }}><div className="gl-sym">{s.sym}</div><div style={{ fontSize:9, color:"var(--muted)" }}>{s.name.split(" ").slice(0,2).join(" ")}</div></div>
              <div style={{ textAlign:"right" }}>
                <div className="gl-price">${s.price.toFixed(2)}</div>
                <span className="chg-pill pos" style={{ fontSize:8 }}>+{s.chgP.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="sec-head"><div className="sec-title">📉 Top Losers</div></div>
          {losers.map((s,i) => (
            <div key={s.sym} className="gl-item" onClick={() => onTrade(s)}>
              <div className="gl-rank">{i+1}</div>
              <div style={{ flex:1 }}><div className="gl-sym">{s.sym}</div><div style={{ fontSize:9, color:"var(--muted)" }}>{s.name.split(" ").slice(0,2).join(" ")}</div></div>
              <div style={{ textAlign:"right" }}>
                <div className="gl-price">${s.price.toFixed(2)}</div>
                <span className="chg-pill neg" style={{ fontSize:8 }}>{s.chgP.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="sec-head"><div className="sec-title">🥧 Sector Allocation</div></div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <PieChart data={SECTOR_ALLOC}/>
            <div style={{ flex:1 }}>
              {SECTOR_ALLOC.map(s => (
                <div key={s.sector} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:9, color:"var(--text2)" }}>{s.sector}</div>
                  <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:10 }}>{s.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Table + Recent Transactions */}
      <div className="grid-3-1">
        <div className="card" style={{ padding:"14px 0" }}>
          <div className="sec-head" style={{ padding:"0 14px", marginBottom:8 }}>
            <div className="sec-title">Market Overview</div>
            <div className="live-label"><span className="live-dot"/>Live</div>
          </div>
          <div className="table-wrap">
            <table className="stock-table">
              <thead><tr>
                <th>Symbol</th><th>Price</th><th>Change</th><th>7D</th><th>Volume</th><th style={{ textAlign:"right" }}>Trade</th>
              </tr></thead>
              <tbody>
                {((stocks && stocks.length>0) ? stocks : STOCKS_DATA).slice(0,6).map(s => (
                  <tr key={s.sym}>
                    <td>
                      <div className="sym-cell">
                        <div className="sym-badge" style={{ background:s.bg, color:s.color }}>{s.sym.slice(0,2)}</div>
                        <div><div className="sym-text">{s.sym}</div><div className="sym-name">{s.name.split(" ").slice(0,2).join(" ")}</div></div>
                      </div>
                    </td>
                    <td><FlashPrice price={prices[s.sym] ?? s.price} prev={s.price}/></td>
                    <td><span className={`chg-pill ${s.chg>=0?"pos":"neg"}`}>{s.chg>=0?"+":""}{s.chgP.toFixed(2)}%</span></td>
                    <td><Spark data={s.spark} color={s.color}/></td>
                    <td style={{ color:"var(--muted)", fontSize:10 }}>{s.vol}</td>
                    <td style={{ textAlign:"right" }}>
                      <div className="btn-group" style={{ justifyContent:"flex-end" }}>
                        <button className="btn btn-buy" onClick={() => onTrade(s)}>Buy</button>
                        <button className="btn btn-sell" onClick={() => onTrade(s)}>Sell</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="sec-head"><div className="sec-title">Recent Activity</div><div className="sec-link">All →</div></div>
          {(transactions && transactions.length > 0 ? transactions : TRANSACTIONS_DATA).slice(0,5).map((tx, i) => {
            const isBuy = (tx.type||"").toUpperCase() === "BUY";
            const sym2  = tx.symbol || tx.sym || "—";
            const qty2  = tx.quantity || tx.qty || 0;
            const price2 = tx.price || 0;
            const amt2  = tx.amount ? Math.abs(tx.amount) : qty2*price2;
            return (
              <div key={i} className="tx-row">
                <div className="tx-type-dot" style={{ background: isBuy ? "var(--accent)" : "var(--danger)" }}/>
                <div className="tx-info">
                  <div className="tx-title">{(tx.type||"?").toUpperCase()} · {sym2}</div>
                  <div className="tx-meta">{qty2} shares · {tx.orderType || tx.type || "Market"}</div>
                </div>
                <div>
                  <div className="tx-amount" style={{ color: isBuy ? "var(--danger)" : "var(--accent)" }}>
                    {isBuy ? "-" : "+"}${amt2.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </div>
                  <div className="tx-time">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : (tx.time||"")}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO PAGE
═══════════════════════════════════════════════════════════════ */
function PortfolioPage({ onTrade, portfolio, stocks, onRefresh }) {
  const dbH = portfolio && portfolio.holdings && portfolio.holdings.length>0 ? portfolio.holdings.map(h => ({ sym:h.symbol, name:h.name||h.symbol, shares:h.quantity, avgPrice:h.averagePrice, current:h.currentPrice||h.averagePrice, sector:h.sector||'Other', pnl:h.pnl||0, color:(h.pnl||0)>=0?'#00e5a0':'#ff4d6d', bg:(h.pnl||0)>=0?'rgba(0,229,160,0.12)':'rgba(255,77,109,0.12)' })) : PORTFOLIO_DATA;
  const totalInvested = dbH.reduce((a,p) => a + (p.avgPrice||0)*(p.shares||0), 0);
  const totalCurrent  = dbH.reduce((a,p) => a + (p.current||0)*(p.shares||0), 0);
  const totalPL = totalCurrent - totalInvested;
  const plPct = (totalPL / totalInvested * 100);
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div className="balance-banner">
        <div className="banner-main">
          <div>
            <div className="balance-label">Portfolio Analytics</div>
            <div className="balance-amount"><span className="curr">$</span><span className="main-val">{totalCurrent.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
            <div className="balance-change">
              <span className="change-pill pos">▲ +${totalPL.toFixed(2)} ({plPct.toFixed(2)}%)</span>
            </div>
          </div>
          <div className="banner-stats">
            <div className="bs-item"><div className="bs-label">Invested</div><div className="bs-val">${totalInvested.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
            <div className="bs-item"><div className="bs-label">Absolute Profit</div><div className="bs-val" style={{ color:"var(--accent)" }}>+${totalPL.toFixed(2)}</div></div>
            <div className="bs-item"><div className="bs-label">% Return</div><div className="bs-val" style={{ color:"var(--accent)" }}>+{plPct.toFixed(2)}%</div></div>
            <div className="bs-item"><div className="bs-label">Positions</div><div className="bs-val">{dbH.length}</div></div>
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ marginBottom:16 }}>
        {dbH.map(p => {
          const pl = ((p.current - p.avgPrice) / p.avgPrice * 100);
          const plAbs = (p.current - p.avgPrice) * p.shares;
          const weight = (p.current * p.shares / totalCurrent * 100).toFixed(1);
          return (
            <div key={p.sym} className="card" style={{ borderColor: pl>=0?"rgba(0,229,160,0.15)":"rgba(255,77,109,0.15)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div className="port-badge" style={{ background:p.bg, color:p.color, width:38, height:38, borderRadius:9, fontSize:12 }}>{p.sym.slice(0,2)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:13 }}>{p.sym}</div>
                  <div style={{ fontSize:9, color:"var(--muted)" }}>{p.name} · {p.sector}</div>
                </div>
                <span className={`chg-pill ${pl>=0?"pos":"neg"}`}>{pl>=0?"+":""}{pl.toFixed(2)}%</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                {[["Shares", p.shares],["Avg Cost", `$${p.avgPrice.toFixed(2)}`],["Current", `$${p.current.toFixed(2)}`],["Mkt Value", `$${(p.current*p.shares).toFixed(2)}`]].map(([l,v]) => (
                  <div key={l} style={{ background:"var(--surface2)", padding:"7px 9px", borderRadius:7 }}>
                    <div style={{ fontSize:8, color:"var(--muted)", letterSpacing:0.8, textTransform:"uppercase" }}>{l}</div>
                    <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:12, marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${weight}%`, background: pl>=0?"var(--accent)":"var(--danger)" }}/></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"var(--muted)", marginTop:3, marginBottom:10 }}>
                <span>Portfolio weight: {weight}%</span>
                <span style={{ color: pl>=0?"var(--accent)":"var(--danger)", fontWeight:600 }}>{pl>=0?"+":""}{plAbs>=0?"+":""}${plAbs.toFixed(2)}</span>
              </div>
              <div className="btn-group">
                <button className="btn btn-buy" style={{ flex:1, padding:"7px" }} onClick={() => onTrade(p)}>Buy More</button>
                <button className="btn btn-sell" style={{ flex:1, padding:"7px" }} onClick={() => onTrade(p)}>Partial Sell</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-card">
        <div className="chart-header">
          <div><div className="chart-title">Portfolio Value Over Time</div><div className="chart-sub">Daily snapshots</div></div>
          <div className="time-tabs">
            {["1W","1M","3M","1Y"].map(t => <div key={t} className={`time-tab ${t==="1M"?"active":""}`}>{t}</div>)}
          </div>
        </div>
        <div style={{ height:140 }}><AreaChart data={CHART_DATA_FULL["1M"]}/></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARKETS PAGE
═══════════════════════════════════════════════════════════════ */
function MarketsPage({ onTrade, onDetail, prices, stocks }) {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState({ col:"sym", dir:1 });
  const sectors = ["All","Tech","Auto","Finance","Energy","Health"];
  const liveArr = (stocks && stocks.length > 0) ? stocks : STOCKS_DATA;
  const filtered = liveArr
    .filter(s => (sector==="All" || s.sector===sector) && ((s.sym||"").toLowerCase().includes(search.toLowerCase()) || (s.name||"").toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => {
      if (sort.col==="price") return (a.price - b.price) * sort.dir;
      if (sort.col==="chgP") return (a.chgP - b.chgP) * sort.dir;
      return a.sym.localeCompare(b.sym) * sort.dir;
    });
  const toggleSort = col => setSort(p => ({ col, dir: p.col===col ? -p.dir : 1 }));
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div className="search-box" style={{ width:240, flex:"none" }}>
          <span style={{ color:"var(--muted)" }}>⌕</span>
          <input placeholder="Search symbol or company..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="page-tabs" style={{ marginBottom:0 }}>
          {sectors.map(s => <div key={s} className={`page-tab ${sector===s?"active":""}`} onClick={() => setSector(s)}>{s}</div>)}
        </div>
        <div className="live-label" style={{ marginLeft:"auto" }}><span className="live-dot"/>Live prices</div>
      </div>
      <div className="card" style={{ padding:"0" }}>
        <div className="table-wrap">
          <table className="stock-table">
            <thead><tr>
              <th onClick={() => toggleSort("sym")}>Symbol {sort.col==="sym"?sort.dir>0?"↑":"↓":"↕"}</th>
              <th onClick={() => toggleSort("price")}>Price {sort.col==="price"?sort.dir>0?"↑":"↓":"↕"}</th>
              <th onClick={() => toggleSort("chgP")}>% Change {sort.col==="chgP"?sort.dir>0?"↑":"↓":"↕"}</th>
              <th style={{ textAlign:"right" }}>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.sym}>
                  <td>
                    <div className="sym-cell">
                      <div className="sym-badge" style={{ background:s.bg, color:s.color }}>{s.sym.slice(0,2)}</div>
                      <div><div className="sym-text">{s.sym}</div><div className="sym-name">{s.name}</div></div>
                    </div>
                  </td>
                  <td><FlashPrice price={prices[s.sym] ?? s.price} prev={s.price}/></td>
                  <td><span className={`chg-pill ${s.chgP>=0?"pos":"neg"}`}>{s.chgP>=0?"+":""}{s.chgP.toFixed(2)}%</span></td>
                  <td style={{ textAlign:"right" }}>
                    <div className="btn-group" style={{ justifyContent:"flex-end", gap:4 }}>
                      <button className="btn btn-buy" style={{ padding:"4px 10px", fontSize:10 }} onClick={() => onTrade(s)}>🛒 Buy</button>
                      <button className="btn btn-sell" style={{ padding:"4px 10px", fontSize:10 }} onClick={() => onTrade(s)}>💸 Sell</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEWS PAGE
═══════════════════════════════════════════════════════════════ */
function NewsPage({ news }) {
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div className="grid-2-1">
        <div className="card">
          <div className="sec-head"><div className="sec-title">📰 Market News</div><div className="live-label"><span className="live-dot"/>Live Feed</div></div>
          {(news && news.length > 0 ? news : NEWS_DATA).map((n, i) => (
            <div key={i} className="news-item">
              <div className="news-img">{n.emoji || "📰"}</div>
              <div className="news-content">
                <div className="news-title">{n.title}</div>
                <div className="news-meta">
                  <span className="news-source">{n.source}</span>
                  <span>·</span><span>{n.time || (n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : "")}</span>
                  <span className="news-tag">{n.tag || ""}</span>
                  <span className="chg-pill" style={{ padding:"1px 5px", fontSize:8, ...((n.sentiment==="pos"||n.sentiment==="positive")?{background:"rgba(0,229,160,0.08)",color:"var(--accent)",border:"1px solid rgba(0,229,160,0.15)"}:{background:"rgba(255,77,109,0.08)",color:"var(--danger)",border:"1px solid rgba(255,77,109,0.15)"}) }}>
                    {(n.sentiment==="pos"||n.sentiment==="positive") ? "Bullish" : "Bearish"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{ marginBottom:10 }}>
            <div className="sec-head"><div className="sec-title">📊 Market Sentiment</div></div>
            {[["Fear & Greed Index","72 · Greed","var(--warn)"],["VIX (Volatility)","18.4 · Low","var(--accent)"],["S&P 500 Trend","Bullish","var(--accent)"],["Market Status","NSE Open","var(--accent)"]].map(([l,v,c]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:11 }}>
                <span style={{ color:"var(--text2)" }}>{l}</span>
                <span style={{ color:c, fontFamily:"var(--font-display)", fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="sec-head"><div className="sec-title">🔥 Trending</div></div>
            {STOCKS_DATA.slice(0,5).map((s,i) => (
              <div key={s.sym} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 0", borderBottom:"1px solid var(--border)", fontSize:11 }}>
                <span style={{ color:"var(--muted)", width:14, textAlign:"right" }}>{i+1}</span>
                <span style={{ fontFamily:"var(--font-display)", fontWeight:700, flex:1 }}>{s.sym}</span>
                <span className={`chg-pill ${s.chgP>=0?"pos":"neg"}`} style={{ fontSize:8 }}>{s.chgP>=0?"+":""}{s.chgP.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEADERBOARD PAGE
═══════════════════════════════════════════════════════════════ */
function LeaderboardPage({ data, user }) {
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div className="grid-2-1">
        <div className="card">
          <div className="sec-head"><div className="sec-title">🏆 Global Rankings</div><div style={{ fontSize:9, color:"var(--muted)" }}>Updates daily</div></div>
          {LEADERBOARD_DATA.map((u,i) => (
            <div key={i} className="lb-item" style={{ background: u.isMe ? "rgba(0,229,160,0.04)" : "", border: u.isMe ? "1px solid rgba(0,229,160,0.15)" : "1px solid transparent", borderRadius:7 }}>
              <div className={`lb-rank ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>{i<3?["🥇","🥈","🥉"][i]:i+1}</div>
              <div className="avatar" style={{ width:28, height:28, fontSize:10 }}>{u.avatar}</div>
              <div className="lb-info">
                <div className="lb-name">{u.name}{u.isMe && <span style={{ fontSize:8, color:"var(--accent)", marginLeft:5, background:"rgba(0,229,160,0.1)", padding:"1px 4px", borderRadius:3 }}>YOU</span>}</div>
                <div className="lb-trades">{u.trades} trades · ${(u.initVal*(1+u.returnPct/100)).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
              </div>
              <div className="lb-return" style={{ color: u.returnPct>=0?"var(--accent)":"var(--danger)" }}>+{u.returnPct.toFixed(1)}%</div>
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{ marginBottom:10 }}>
            <div className="sec-head"><div className="sec-title">Your Rank</div></div>
            <div style={{ textAlign:"center", padding:"14px 0" }}>
              <div style={{ fontSize:42, fontFamily:"var(--font-display)", fontWeight:800, color:"var(--accent)" }}>#3</div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:3 }}>Out of 1,284 traders</div>
              <div style={{ marginTop:10 }}><span className="chg-pill pos" style={{ fontSize:10 }}>+27.84% Return</span></div>
            </div>
          </div>
          <div className="card">
            <div className="sec-head"><div className="sec-title">🏅 Badges Earned</div></div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {BADGES_DATA.filter(b => b.earned).map(b => (
                <div key={b.name} title={b.desc} style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:7, padding:"5px 9px", display:"flex", alignItems:"center", gap:5, fontSize:10 }}>
                  <span>{b.icon}</span>
                  <span style={{ fontFamily:"var(--font-display)", fontWeight:600 }}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACHIEVEMENTS PAGE
═══════════════════════════════════════════════════════════════ */
function AchievementsPage() {
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:15, marginBottom:3 }}>Achievements & Badges</div>
        <div style={{ fontSize:10, color:"var(--muted)" }}>4 of 8 badges earned · Keep trading to unlock more!</div>
        <div className="progress-bar" style={{ marginTop:6, height:5 }}>
          <div className="progress-fill" style={{ width:"50%", background:"var(--accent)" }}/>
        </div>
      </div>
      <div className="badges-grid">
        {BADGES_DATA.map(b => (
          <div key={b.name} className={`badge-item ${b.earned?"earned":"locked"}`}>
            <span className="badge-icon">{b.icon}</span>
            <div className="badge-name">{b.name}</div>
            <div className="badge-desc">{b.desc}</div>
            {b.earned && <div style={{ marginTop:5, fontSize:8, color:"var(--accent)", fontWeight:700 }}>✓ EARNED</div>}
            {!b.earned && <div style={{ marginTop:5, fontSize:8, color:"var(--muted)" }}>🔒 LOCKED</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WALLET PAGE
═══════════════════════════════════════════════════════════════ */
function WalletPage({ cash, onRefresh }) {
  const [walletModal, setWalletModal] = useState(null);
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      {walletModal && <WalletModal onClose={() => { setWalletModal(false); if (onRefresh) onRefresh(); }}/>}
      <div className="grid-3" style={{ marginBottom:16 }}>
        <div className="wallet-card">
          <div className="balance-label">Virtual Cash Balance</div>
          <div className="wallet-amount">$47,215.64</div>
          <div style={{ fontSize:10, color:"var(--muted)" }}>Available for trading</div>
          <div className="wallet-actions">
            <button className="wallet-btn add" onClick={() => setWalletModal("add")}>+ Add Funds</button>
            <button className="wallet-btn withdraw" onClick={() => setWalletModal("withdraw")}>↓ Withdraw</button>
          </div>
        </div>
        <div className="card">
          <div className="card-label">Total Portfolio</div>
          <div className="card-val">$127,842</div>
          <div className="card-sub"><span className="change-pill pos" style={{ fontSize:8 }}>+27.84%</span></div>
        </div>
        <div className="card">
          <div className="card-label">Total Invested</div>
          <div className="card-val">$80,626</div>
          <div className="card-sub" style={{ color:"var(--text2)" }}>Across 4 stocks</div>
        </div>
      </div>
      <div className="card">
        <div className="sec-head"><div className="sec-title">📒 Transaction Ledger</div></div>
        <div className="table-wrap">
          <table className="stock-table">
            <thead><tr><th>Type</th><th>Description</th><th>Amount</th><th>Balance After</th><th style={{ textAlign:"right" }}>Date</th></tr></thead>
            <tbody>
              {[
                { type:"BUY",  desc:"NVDA × 2 @ $858.00", amount:-1716, bal:47215 },
                { type:"SELL", desc:"META × 10 @ $486.50", amount:+4865, bal:48931 },
                { type:"ADD",  desc:"Funds added via UPI", amount:+10000, bal:44066 },
                { type:"BUY",  desc:"AAPL × 5 @ $185.20", amount:-926, bal:34066 },
                { type:"SELL", desc:"MSFT × 3 @ $372.10", amount:+1116, bal:34992 },
              ].map((tx,i) => (
                <tr key={i}>
                  <td><span className={`chg-pill ${tx.type==="BUY"?"neg":tx.type==="ADD"?"pos":"pos"}`} style={{ fontSize:8 }}>{tx.type}</span></td>
                  <td style={{ color:"var(--text2)" }}>{tx.desc}</td>
                  <td style={{ color: tx.amount<0?"var(--danger)":"var(--accent)", fontFamily:"var(--font-display)", fontWeight:700 }}>{tx.amount>0?"+":""}${Math.abs(tx.amount).toLocaleString()}</td>
                  <td style={{ fontFamily:"var(--font-display)", fontWeight:600 }}>${tx.bal.toLocaleString()}</td>
                  <td style={{ textAlign:"right", color:"var(--muted)", fontSize:10 }}>{["2h ago","5h ago","1d ago","2d ago","3d ago"][i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PAGE
═══════════════════════════════════════════════════════════════ */
function AdminPage() {
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div className="grid-4" style={{ marginBottom:16 }}>
        {[
          { l:"Total Users", v:"1,284", i:"👥", sub:"+12 today", cls:"blue" },
          { l:"Active Trades", v:"347", i:"⚡", sub:"Live orders", cls:"green" },
          { l:"Daily Volume", v:"$4.2M", i:"💹", sub:"Today", cls:"purple" },
          { l:"Listed Stocks", v:"128", i:"📋", sub:"All active", cls:"red" },
        ].map(s => (
          <div key={s.l} className={`stat-card ${s.cls}`}>
            <span className="card-icon">{s.i}</span>
            <div className="card-label">{s.l}</div>
            <div className="card-val">{s.v}</div>
            <div className="card-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="sec-head">
          <div className="sec-title">Stock Management</div>
          <button className="btn-accent">+ Add Stock</button>
        </div>
        <div className="table-wrap">
          <table className="stock-table">
            <thead><tr><th>Symbol</th><th>Name</th><th>Price</th><th>Sector</th><th>Status</th><th style={{ textAlign:"right" }}>Actions</th></tr></thead>
            <tbody>
              {STOCKS_DATA.map(s => (
                <tr key={s.sym}>
                  <td className="sym-text">{s.sym}</td>
                  <td style={{ color:"var(--text2)" }}>{s.name}</td>
                  <td style={{ fontFamily:"var(--font-display)", fontWeight:600 }}>${s.price.toFixed(2)}</td>
                  <td><span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text2)" }}>{s.sector}</span></td>
                  <td><span className="chg-pill pos" style={{ fontSize:8 }}>Active</span></td>
                  <td style={{ textAlign:"right" }}>
                    <div className="btn-group" style={{ justifyContent:"flex-end" }}>
                      <button className="btn btn-buy" onClick={() => showToast("info","Edit Stock",`Editing ${s.sym}`)}>Edit</button>
                      <button className="btn btn-sell" onClick={() => showToast("warn","Removed",`${s.sym} removed`)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV CONFIG
═══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id:"dashboard",     icon:"⬡", label:"Dashboard" },
  { id:"markets",       icon:"◈", label:"Markets" },
  { id:"portfolio",     icon:"◉", label:"Portfolio" },
  { id:"wallet",        icon:"💳", label:"Wallet" },
  { id:"news",          icon:"📰", label:"News Feed" },
  { id:"leaderboard",   icon:"🏆", label:"Leaderboard" },
  { id:"achievements",  icon:"🏅", label:"Achievements", badge:"4" },
  { id:"transactions",  icon:"↕",  label:"History" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme]     = useState("dark");
  const [user, setUser]       = useState(null);
  const [page, setPage]       = useState("dashboard");
  const [modal, setModal]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices]   = useState({});
  const [stocks, setStocks]   = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [news, setNews]       = useState([]);
  const [walletModal, setWalletModal] = useState(false);
  const [stockDetail, setStockDetail] = useState(null);
  const [marketOpen]          = useState(true);

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    return () => document.body.classList.remove("theme-light");
  }, [theme]);

  const loadAppData = useCallback(async () => {
    try {
      setLoading(true);
      const [stockRes, portRes, txRes, lbRes, newsRes] = await Promise.allSettled([
        API.getStocks(), API.getPortfolio(), API.getTransactions(), API.getLeaderboard(), API.getNews()
      ]);
      if (stockRes.status === "fulfilled") {
        const sArr = stockRes.value.data || [];
        setStocks(sArr);
        const pm = {};
        sArr.forEach(s => { pm[s.symbol] = s.currentPrice; });
        setPrices(pm);
      }
      if (portRes.status === "fulfilled")  setPortfolio(portRes.value.data);
      if (txRes.status === "fulfilled")    setTransactions(txRes.value.data || []);
      if (lbRes.status === "fulfilled")    setLeaderboard(lbRes.value.data || []);
      if (newsRes.status === "fulfilled")  setNews(newsRes.value.data || []);
    } catch(e) { console.error("loadAppData:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) loadAppData(); }, [user]);

  useEffect(() => {
    if (!user || !stocks.length) return;
    const iv = setInterval(async () => {
      try {
        const res = await API.getStocks();
        const sArr = res.data || [];
        setStocks(sArr);
        const pm = {};
        sArr.forEach(s => { pm[s.symbol] = s.currentPrice; });
        setPrices(pm);
      } catch(_) {}
    }, 3000);
    return () => clearInterval(iv);
  }, [user, stocks.length]);

  const liveStocks = stocks.length > 0
    ? stocks.map(s => ({
        sym: s.symbol, name: s.name, price: s.currentPrice,
        chg: s.change, chgP: s.changePercent, sector: s.sector,
        cap: s.marketCap, vol: s.volume,
        color: s.changePercent >= 0 ? "#00e5a0" : "#ff4d6d",
        spark: (s.priceHistory || []).slice(-8).map(h => h.price),
        bg: s.changePercent >= 0 ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)",
      }))
    : STOCKS_DATA;

  if (!user) {
    return (
      <>
        <style>{FONTS + GLOBAL_CSS}</style>
        <ToastContainer/>
        <AuthPage onLogin={u => { setUser(u); }}/>
      </>
    );
  }

  const cash    = portfolio ? portfolio.cashBalance : (user.cashBalance || 100000);
  const portVal = portfolio ? portfolio.portfolioTotal : cash;
  const portPnL = portfolio ? portfolio.totalPnL : 0;
  const portPnLPct = portfolio ? portfolio.totalPnLPercent : 0;
  const userInitials = (user.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  const pageTitle = { dashboard:"Dashboard", markets:"Markets", portfolio:"Portfolio", wallet:"Wallet", news:"News Feed", leaderboard:"Leaderboard", achievements:"Achievements", transactions:"History", admin:"Admin Panel" };

  return (
    <>
      <style>{FONTS + GLOBAL_CSS}</style>
      <ToastContainer/>
      {modal && <TradeModal stock={modal} onClose={() => setModal(null)} onOrderPlaced={loadAppData}/>}
      {stockDetail && <StockDetailModal stock={stockDetail} onClose={() => setStockDetail(null)} onTrade={s => { setStockDetail(null); setModal(s); }}/>}

      <div className="app-wrapper">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">SB</div>
            <div>
              <div className="logo-text">SB <span>Stocks</span></div>
              <div className="logo-sub">PAPER TRADING</div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Trading</div>
            {NAV_ITEMS.slice(0,4).map(n => (
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>{n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Insights</div>
            {NAV_ITEMS.slice(4,8).map(n => (
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>{n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">System</div>
            <div className={`nav-item ${page==="admin"?"active":""}`} onClick={() => setPage("admin")}>
              <span className="nav-icon">⚙</span>Admin
              <span className="admin-badge" style={{ marginLeft:"auto" }}>ADM</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="market-status">
              <div className={`status-dot ${marketOpen?"open":"closed"}`}/>
              <span style={{ color: marketOpen?"var(--accent)":"var(--muted)", fontWeight:600, fontSize:9 }}>{marketOpen?"NSE Open":"Closed"}</span>
            </div>
            <div className="user-card" style={{ marginTop:6 }}>
              <div className="user-card-inner">
                <div className="avatar">{userInitials}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role === "admin" ? "Admin" : "Trader"}</div>
                  <div className="user-balance">${portVal.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
                </div>
                <span title="Logout" style={{ color:"var(--muted)", cursor:"pointer", fontSize:12, flexShrink:0 }} onClick={() => { setToken(null); setUser(null); setPortfolio(null); setStocks([]); }}>⏻</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          {/* Topbar — all items always visible */}
          <div className="topbar">
            <div className="topbar-title">
              {pageTitle[page]}
              <span className="topbar-crumb">/ SB Stocks</span>
            </div>
            <div className="topbar-spacer"/>
            <SearchBar onTrade={s => { setModal(s); setPage("markets"); }}/>
            <div className="icon-btn" title="Notifications" onClick={() => showToast("info","3 Alerts","Your limit order for TSLA is near target price")}>
              🔔<div className="notif-badge"/>
            </div>
            <div className="icon-btn" title={`Switch to ${theme==="dark"?"light":"dark"} mode`}
              onClick={() => { setTheme(t => t==="dark"?"light":"dark"); showToast("info", theme==="dark"?"Light Mode":"Dark Mode","Theme changed"); }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </div>
            <div className="icon-btn" title="Settings">⚙</div>
          </div>

          {/* Ticker */}
          <ConnectionBanner/>
          <TickerTape prices={prices}/>

          {/* Sticky bar — compact, no overflow */}
          <div className="sticky-bar">
            <div className="sticky-stat">
              <span className="sticky-label">Portfolio</span>
              <span className="sticky-val" style={{ color:"var(--accent)" }}>${portVal.toLocaleString("en-US",{maximumFractionDigits:0})}</span>
            </div>
            <div className="sticky-divider"/>
            <div className="sticky-stat">
              <span className="sticky-label">P&L</span>
              <span className="sticky-val" style={{ color: portPnL>=0?"var(--accent)":"var(--danger)" }}>{portPnL>=0?"+":""}{portPnL.toFixed(0)}</span>
            </div>
            <div className="sticky-divider"/>
            <div className="sticky-stat">
              <span className="sticky-label">Cash</span>
              <span className="sticky-val">${cash.toLocaleString("en-US",{maximumFractionDigits:0})}</span>
            </div>
            <div className="sticky-divider"/>
            <div className="sticky-stat">
              <span className="sticky-label">Return</span>
              <span className="sticky-val" style={{ color: portPnLPct>=0?"var(--accent)":"var(--danger)" }}>{portPnLPct>=0?"+":""}{portPnLPct.toFixed(2)}%</span>
            </div>
            <div className="sticky-actions">
              <button className="btn btn-buy" style={{ padding:"4px 10px", fontSize:10 }} onClick={() => setPage("markets")}>Buy</button>
              <button className="btn btn-sell" style={{ padding:"4px 10px", fontSize:10 }} onClick={() => setPage("portfolio")}>Sell</button>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {page === "dashboard"    && <Dashboard onTrade={s => setModal(s)} prices={prices} loading={loading} stocks={liveStocks} portfolio={portfolio} user={user} transactions={transactions}/>}
            {page === "markets"      && <MarketsPage onTrade={s => setModal(s)} onDetail={s => setStockDetail(s)} prices={prices} stocks={liveStocks}/>}
            {page === "portfolio"    && <PortfolioPage onTrade={s => setModal(s)} portfolio={portfolio} stocks={liveStocks} onRefresh={loadAppData}/>}
            {page === "wallet"       && <WalletPage cash={cash} onRefresh={loadAppData}/>}
            {page === "news"         && <NewsPage news={news}/>}
            {page === "leaderboard"  && <LeaderboardPage data={leaderboard} user={user}/>}
            {page === "achievements" && <AchievementsPage/>}
            {page === "admin"        && <AdminPage/>}
            {page === "transactions" && (
              <div className="card" style={{ animation:"slideUp 0.3s ease" }}>
                <div className="sec-head"><div className="sec-title">Transaction History</div></div>
                <div className="page-tabs">
                  {["All","Buy","Sell","Limit","Stop-Loss"].map(t => <div key={t} className={`page-tab ${t==="All"?"active":""}`}>{t}</div>)}
                </div>
                <div className="table-wrap">
                  <table className="stock-table">
                    <thead><tr><th>Type</th><th>Symbol</th><th>Qty</th><th>Price</th><th>Order Type</th><th>Total</th><th style={{ textAlign:"right" }}>Time</th></tr></thead>
                    <tbody>
                      {transactions.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign:"center", color:"var(--muted)", padding:28 }}>No transactions yet. Start trading! 🚀</td></tr>
                      )}
                      {transactions.map((tx,i) => (
                        <tr key={i}>
                          <td><span className={`chg-pill ${tx.type==="buy"?"pos":"neg"}`} style={{ fontSize:8 }}>{tx.type.toUpperCase()}</span></td>
                          <td className="sym-text">{tx.symbol || "—"}</td>
                          <td style={{ color:"var(--text2)" }}>{tx.quantity || "—"}</td>
                          <td style={{ fontFamily:"var(--font-display)", fontWeight:600 }}>{tx.price ? "$"+tx.price.toFixed(2) : "—"}</td>
                          <td><span style={{ fontSize:9, color:"var(--muted)" }}>{tx.orderType || tx.type}</span></td>
                          <td style={{ fontFamily:"var(--font-display)", fontWeight:700, color: tx.type==="buy"?"var(--danger)":"var(--accent)" }}>
                            {tx.type==="buy"?"-":"+"}{Math.abs(tx.amount||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                          </td>
                          <td style={{ textAlign:"right", color:"var(--muted)", fontSize:10 }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}