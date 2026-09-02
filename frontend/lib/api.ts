import axios from 'axios';

export const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Holding {
  scheme_code: string;
  scheme_name: string;
  units: number;
  avg_buy_price: number;
  current_nav: number;
  current_value: number;
  profit_loss: number;
  returns_percentage: number;
  nav_date: string;
  folio_number?: string;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  overall_return_percentage: number;
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
  latest_nav_date: string;
  metrics: {
    return_1m_pct: number | null;
    return_6m_pct: number | null;
    return_1y_pct: number | null;
    all_time_return_pct: number | null;
  };
}

export const fetchPortfolio = async (): Promise<PortfolioResponse> => {
  const res = await api.get('/portfolio');
  return res.data;
};

export const fetchWatchlist = async (): Promise<WatchlistFund[]> => {
  const res = await api.get('/tracker/watchlist');
  return res.data;
};

export const fetchFundDetail = async (schemeCode: string) => {
  const res = await api.get(`/tracker/fund/${schemeCode}`);
  return res.data;
};

export const getInactiveHoldings = () => api.get('/inactive-portfolio');
export const addInactiveHolding = (data: any) => api.post('/inactive-portfolio', data);
export const deleteInactiveHolding = (id: number) => api.delete(`/inactive-portfolio/${id}`);

export const updateInactiveHolding = (id: number, data: any) => 
  api.put(`/inactive-portfolio/${id}`, data);

export const getInactiveHoldings = async (): Promise<PortfolioResponse> => {
  const res = await api.get('/inactive-portfolio');
  return res.data;
};

export default api;