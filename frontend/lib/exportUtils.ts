import * as XLSX from 'xlsx';
import { Holding, PortfolioSummary } from './api';

const prepareExportRows = (holdings: Holding[]) => {
  return holdings.map((h, index) => ({
    'Sr No': index + 1,
    'Scheme Code': h.scheme_code,
    'Scheme Name': h.scheme_name,
    'Folio Number': h.folio_number || 'N/A',
    'Units Held': h.units,
    'Avg Buy Price (₹)': h.avg_buy_price,
    'Total Invested (₹)': Number((h.units * h.avg_buy_price).toFixed(2)),
    'Latest NAV (₹)': h.current_nav,
    'NAV Date': h.nav_date,
    'Current Value (₹)': h.current_value,
    'Profit / Loss (₹)': h.profit_loss,
    'Returns (%)': h.returns_percentage,
  }));
};

export const exportToExcel = (holdings: Holding[], summary: PortfolioSummary) => {
  const rows = prepareExportRows(holdings);

  // Sheet 1: Holdings Data
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Sheet 2: Portfolio Summary Overview
  const summaryData = [
    { Metric: 'Total Invested Capital (₹)', Value: summary.total_invested },
    { Metric: 'Current Net Worth (₹)', Value: summary.total_current_value },
    { Metric: 'Total Profit / Loss (₹)', Value: summary.total_profit_loss },
    { Metric: 'Overall Return (%)', Value: `${summary.overall_return_percentage}%` },
    { Metric: 'Statement Date', Value: new Date().toLocaleDateString('en-IN') },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Holdings');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Portfolio Summary');

  XLSX.writeFile(workbook, `myCAMS_Portfolio_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToCSV = (holdings: Holding[]) => {
  const rows = prepareExportRows(holdings);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `myCAMS_Holdings_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};