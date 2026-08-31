from typing import List, Dict
from app.services.amfi_fetcher import get_latest_nav

def calculate_portfolio_valuation(holdings: List[Dict]) -> Dict:
    """
    Computes real-time portfolio valuation based on latest NAV.
    Each holding expects:
    {
        "scheme_code": "120503",
        "scheme_name": "Parag Parikh Flexi Cap Fund",
        "units": 150.5,
        "avg_buy_price": 62.40
    }
    """
    detailed_holdings = []
    total_invested = 0.0
    total_current_value = 0.0

    for item in holdings:
        scheme_code = str(item["scheme_code"])
        units = float(item["units"])
        avg_price = float(item.get("avg_buy_price", 0.0))
        
        invested_value = round(units * avg_price, 2)
        total_invested += invested_value

        nav_data = get_latest_nav(scheme_code)
        if nav_data:
            current_nav = nav_data["nav"]
            nav_date = nav_data["date"]
            fund_name = nav_data["scheme_name"]
        else:
            current_nav = avg_price
            nav_date = "N/A"
            fund_name = item.get("scheme_name", "Unknown Fund")

        current_value = round(units * current_nav, 2)
        total_current_value += current_value

        profit_loss = round(current_value - invested_value, 2)
        returns_percentage = (
            round((profit_loss / invested_value) * 100, 2) if invested_value > 0 else 0.0
        )

        detailed_holdings.append({
            "scheme_code": scheme_code,
            "scheme_name": fund_name,
            "units": units,
            "avg_buy_price": avg_price,
            "current_nav": current_nav,
            "nav_date": nav_date,
            "invested_value": invested_value,
            "current_value": current_value,
            "profit_loss": profit_loss,
            "returns_percentage": returns_percentage
        })

    total_profit_loss = round(total_current_value - total_invested, 2)
    overall_return_percentage = (
        round((total_profit_loss / total_invested) * 100, 2) if total_invested > 0 else 0.0
    )

    return {
        "summary": {
            "total_invested": round(total_invested, 2),
            "total_current_value": round(total_current_value, 2),
            "total_profit_loss": total_profit_loss,
            "overall_return_percentage": overall_return_percentage,
            "active_funds_count": len(holdings)
        },
        "holdings": detailed_holdings
    }