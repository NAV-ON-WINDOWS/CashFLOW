import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional

def fetch_fund_history(scheme_code: str) -> Optional[Dict]:
    """
    Pulls full historical NAV series from the open AMFI proxy API.
    """
    url = f"https://api.mfapi.in/mf/{scheme_code}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None
        return response.json()
    except Exception:
        return None

def calculate_performance_metrics(scheme_code: str) -> Optional[Dict]:
    """
    Parses historical data and calculates 1M, 6M, 1Y percentage growth
    along with trimmed timeseries for frontend charting.
    """
    raw_data = fetch_fund_history(scheme_code)
    if not raw_data or "data" not in raw_data or not raw_data["data"]:
        return None

    meta = raw_data.get("meta", {})
    # Data is ordered newest to oldest: [{"date": "dd-mm-yyyy", "nav": "xx.xx"}, ...]
    nav_history = raw_data["data"]

    current_entry = nav_history[0]
    current_nav = float(current_entry["nav"])
    current_date = datetime.strptime(current_entry["date"], "%d-%m-%Y")

    def get_nav_approx(target_date: datetime) -> Optional[float]:
        for point in nav_history:
            point_date = datetime.strptime(point["date"], "%d-%m-%Y")
            if point_date <= target_date:
                return float(point["nav"])
        return float(nav_history[-1]["nav"])

    nav_1m = get_nav_approx(current_date - timedelta(days=30))
    nav_6m = get_nav_approx(current_date - timedelta(days=182))
    nav_1y = get_nav_approx(current_date - timedelta(days=365))
    initial_nav = float(nav_history[-1]["nav"])

    def calc_pct_return(old_nav: Optional[float], new_nav: float) -> Optional[float]:
        if not old_nav or old_nav == 0:
            return None
        return round(((new_nav - old_nav) / old_nav) * 100, 2)

    # Prepare historical chart points (reversing order to oldest -> newest for charts)
    # Sampling the last 365 available trading days
    chart_points = [
        {"date": item["date"], "nav": float(item["nav"])}
        for item in reversed(nav_history[:365])
    ]

    return {
        "scheme_code": scheme_code,
        "scheme_name": meta.get("scheme_name", "Unknown Fund"),
        "fund_house": meta.get("fund_house", "N/A"),
        "category": meta.get("scheme_category", "N/A"),
        "latest_nav": current_nav,
        "latest_date": current_entry["date"],
        "metrics": {
            "return_1m_pct": calc_pct_return(nav_1m, current_nav),
            "return_6m_pct": calc_pct_return(nav_6m, current_nav),
            "return_1y_pct": calc_pct_return(nav_1y, current_nav),
            "all_time_return_pct": calc_pct_return(initial_nav, current_nav),
        },
        "chart_data_1y": chart_points
    }