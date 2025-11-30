from fastapi import APIRouter
from services.currency_service import get_usd_to_uzs_rate, get_dual_currency_display

router = APIRouter(prefix="/currency", tags=["Currency"])

@router.get("/exchange-rate")
async def get_exchange_rate():
    """
    Get current USD to UZS exchange rate
    Returns cached rate if recent, otherwise fetches fresh rate
    """
    rate_info = await get_usd_to_uzs_rate()
    return {
        "success": True,
        "data": {
            "from": "USD",
            "to": "UZS",
            "rate": rate_info["rate"],
            "last_updated": rate_info["last_updated"],
            "source": rate_info.get("source", "unknown")
        }
    }

@router.get("/convert")
async def convert_amount(amount: float, from_currency: str = "UZS"):
    """
    Convert amount between USD and UZS
    Query params:
    - amount: Amount to convert
    - from_currency: "UZS" or "USD" (default: UZS)
    """
    if from_currency.upper() == "UZS":
        result = await get_dual_currency_display(amount)
        return {
            "success": True,
            "data": {
                "original_amount": amount,
                "original_currency": "UZS",
                "converted_amount": result["usd"],
                "converted_currency": "USD",
                "exchange_rate": result["exchange_rate"],
                "last_updated": result["last_updated"]
            }
        }
    else:
        rate_info = await get_usd_to_uzs_rate()
        uzs_amount = amount * rate_info["rate"]
        return {
            "success": True,
            "data": {
                "original_amount": amount,
                "original_currency": "USD",
                "converted_amount": round(uzs_amount, 2),
                "converted_currency": "UZS",
                "exchange_rate": rate_info["rate"],
                "last_updated": rate_info["last_updated"]
            }
        }
