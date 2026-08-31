import requests

def get_latest_nav(scheme_code: str):
    url = "https://www.amfiindia.com/spages/NAVAll.txt"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            return None
            
        lines = response.text.splitlines()
        target_code = str(scheme_code).strip()

        for line in lines:
            line = line.strip()
            if not line or ";" not in line:
                continue
                
            parts = [p.strip() for p in line.split(";")]
            
            if parts[0] == target_code and len(parts) >= 5:
                # The last two entries are ALWAYS Net Asset Value and Date
                nav_str = parts[-2]
                date_str = parts[-1]
                
                # Scheme name is located after the ISINs and before options/NAV
                # Joining intermediate tokens handles names with semicolons
                scheme_name = parts[3] if len(parts) == 6 else " - ".join(parts[3:-2])

                try:
                    nav_value = float(nav_str)
                except ValueError:
                    nav_value = 0.0

                return {
                    "scheme_code": parts[0],
                    "scheme_name": scheme_name,
                    "nav": nav_value,
                    "date": date_str
                }
        return None
    except Exception as e:
        print(f"Error fetching AMFI NAV: {e}")
        return None