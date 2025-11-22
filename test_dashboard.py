import urllib.request
import json

url = "http://127.0.0.1:8000/dashboard/recent"

try:
    response = urllib.request.urlopen(url)
    print(f"Status Code: {response.getcode()}")
    data = json.loads(response.read().decode('utf-8'))
    print(f"Response count: {len(data)}")
    if len(data) > 0:
        print(f"First item keys: {data[0].keys()}")
        if 'risk_score' in data[0]:
            print(f"Risk Score: {data[0]['risk_score']}")
        else:
            print("Risk Score missing!")
except Exception as e:
    print(f"Error: {e}")
