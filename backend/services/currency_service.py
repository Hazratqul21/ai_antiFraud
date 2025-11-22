"""
Currency Exchange Rate Service
Fetches real-time USD to UZS exchange rate
"""
import httpx
import asyncio
from datetime import datetime, timedelta

# API configuration
CURRENCY_API_KEY = "df77792d3a7b00f64898e034"
CURRENCY_API_URL = "https://api.currencyapi.com/v3/latest"

# Cache to avoid hitting API too frequently
_exchange_rate_cache = {
    "rate": 12500.0,  # Default fallback rate
    "last_updated": None,
    "cache_duration": timedelta(hours=1)  # Update every hour
}

async def get_usd_to_uzs_rate() -> dict:
    """
    Get current USD to UZS exchange rate
    Returns cached rate if less than 1 hour old
    """
    global _exchange_rate_cache
    
    # Check if cache is valid
    if (_exchange_rate_cache["last_updated"] and 
        datetime.now() - _exchange_rate_cache["last_updated"] < _exchange_rate_cache["cache_duration"]):
        return {
            "rate": _exchange_rate_cache["rate"],
            "last_updated": _exchange_rate_cache["last_updated"].isoformat(),
            "source": "cache"
        }
    
    # Fetch new rate
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            params = {
                "apikey": CURRENCY_API_KEY,
                "base_currency": "USD",
                "currencies": "UZS"
            }
            response = await client.get(CURRENCY_API_URL, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract UZS rate
                if "data" in data and "UZS" in data["data"]:
                    rate = data["data"]["UZS"]["value"]
                    
                    # Update cache
                    _exchange_rate_cache["rate"] = rate
                    _exchange_rate_cache["last_updated"] = datetime.now()
                    
                    return {
                        "rate": rate,
                        "last_updated": _exchange_rate_cache["last_updated"].isoformat(),
                        "source": "api"
                    }
            
            # If API fails, return cached rate
            return {
                "rate": _exchange_rate_cache["rate"],
                "last_updated": _exchange_rate_cache["last_updated"].isoformat() if _exchange_rate_cache["last_updated"] else None,
                "source": "cache_fallback",
                "error": f"API returned status {response.status_code}"
            }
            
    except Exception as e:
        print(f"❌ Error fetching currency rate: {e}")
        return {
            "rate": _exchange_rate_cache["rate"],
            "last_updated": _exchange_rate_cache["last_updated"].isoformat() if _exchange_rate_cache["last_updated"] else None,
            "source": "cache_fallback",
            "error": str(e)
        }

def uzs_to_usd(uzs_amount: float, rate: float = None) -> float:
    """Convert UZS to USD"""
    if rate is None:
        rate = _exchange_rate_cache["rate"]
    return round(uzs_amount / rate, 2)

def usd_to_uzs(usd_amount: float, rate: float = None) -> float:
    """Convert USD to UZS"""
    if rate is None:
        rate = _exchange_rate_cache["rate"]
    return round(usd_amount * rate, 2)

async def get_dual_currency_display(uzs_amount: float) -> dict:
    """
    Get amount in both UZS and USD with current exchange rate
    """
    rate_info = await get_usd_to_uzs_rate()
    rate = rate_info["rate"]
    
    return {
        "uzs": uzs_amount,
        "usd": uzs_to_usd(uzs_amount, rate),
        "exchange_rate": rate,
        "last_updated": rate_info["last_updated"]
    }
