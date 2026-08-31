import requests

def get_latest_nav(scheme_code: str):
    url = "https://www.amfiindia.com/spages/NAVAll.txt"
    response = requests.get(url)
    
    if response.status_code != 200:
        return None
        
    lines = response.text.split("\n")
    for line in lines:
        # AMFI text file format: Scheme Code;ISIN;ISIN;Scheme Name;NAV;Date
        if line.startswith(str(scheme_code)):
            parts = line.split(";")
            if len(parts) >= 5:
                return {
                    "scheme_code": parts[0],
                    "scheme_name": parts[3],
                    "nav": float(parts[4]),
                    "date": parts[5].strip()
                }
    return None