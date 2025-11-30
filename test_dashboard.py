import urllib.request
import urllib.request
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

url = "http://127.0.0.1:8000/dashboard/recent"

try:
    response = urllib.request.urlopen(url)
    logger.info(f"Status Code: {response.getcode()}")
    data = json.loads(response.read().decode('utf-8'))
    logger.info(f"Response count: {len(data)}")
    if len(data) > 0:
        logger.info(f"First item keys: {data[0].keys()}")
        if 'risk_score' in data[0]:
            logger.info(f"Risk Score: {data[0]['risk_score']}")
        else:
            logger.warning("Risk Score missing!")
except Exception as e:
    logger.error(f"Error: {e}")
