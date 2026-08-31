import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export interface Holding {
  scheme_code: string;
  scheme_name: string;
  units: number;
  avg_buy_price: number;
  current_nav: number;
  nav_date: string;
  invested_value: number;
  current_value: number;
  profit_loss: number;
  returns_percentage: number;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  overall_return_percentage: number;
  active_funds_count: number;
}

export interface PortfolioResponse {
  summary: PortfolioSummary;
  holdings: Holding[];
}

export interface WatchlistFund {
  scheme_code: string;
  scheme_name: string;
  category: string;
  latest_nav: number;
  metrics: {
    return_1m_pct: number | null;
    return_6m_pct: number | null;
    return_1y_pct: number | null;
    all_time_return_pct: number | null;
  };
}

export const fetchPortfolio = async (): Promise<PortfolioResponse> => {
  const res = await axios.get(`${API_BASE}/portfolio`);
  return res.data;
};

export const fetchWatchlist = async (): Promise<WatchlistFund[]> => {
  const res = await axios.get(`${API_BASE}/tracker/watchlist`);
  return res.data;
};

export const fetchFundDetail = async (schemeCode: string) => {
  const res = await axios.get(`${API_BASE}/tracker/fund/${schemeCode}`);
  return res.data;
};