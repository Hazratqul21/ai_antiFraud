import urllib.request
import json

url = "http://127.0.0.1:8000/transactions/"
data = {
    "transaction_id": "tx_123456",
    "user_id": "user_001",
    "amount": 12000,
    "currency": "USD",
    "merchant": "SuperStore",
    "ip_address": "192.168.1.1",
    "location": "NY, USA",
    "device_id": "dev_001"
}

req = urllib.request.Request(url)
req.add_header('Content-Type', 'application/json; charset=utf-8')
jsondata = json.dumps(data)
jsondataasbytes = jsondata.encode('utf-8')
req.add_header('Content-Length', len(jsondataasbytes))

try:
    response = urllib.request.urlopen(req, jsondataasbytes)
    print(f"Status Code: {response.getcode()}")
    print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
