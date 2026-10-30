# shamba.py - M-Pesa Daraja STK Push backend for b10fhonix.online
# Install: pip install flask flask-cors requests python-dotenv
# Run: python shamba.py -> will listen on :5000, then set frontend fetch to your Render/Vercel URL
import os, base64, requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# TODO: Put your Daraja credentials in .env, NEVER commit them
# Get from https://developer.safaricom.co.ke
CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "YOUR_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "YOUR_SECRET")
SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379") # Test Paybill
PASSKEY = os.getenv("MPESA_PASSKEY", "YOUR_PASSKEY")
CALLBACK_URL = os.getenv("CALLBACK_URL", "https://b10fhonix.online/callback") # must be https

def get_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    r = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
    return r.json().get('access_token')

@app.route('/api/stkpush', methods=['POST'])
def stkpush():
    data = request.json
    phone = data.get('phone') # 2547XXXXXXXX
    amount = int(data.get('amount', 1))
    try:
        token = get_token()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{SHORTCODE}{PASSKEY}{timestamp}".encode()).decode()
        payload = {
            "BusinessShortCode": SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": CALLBACK_URL,
            "AccountReference": "b10fhonix",
            "TransactionDesc": "Deposit"
        }
        headers = {"Authorization": f"Bearer {token}"}
        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        res = requests.post(url, json=payload, headers=headers)
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/')
def home():
    return "b10fhonix STK backend running - POST /api/stkpush"

if __name__ == '__main__':
    app.run(port=5000, debug=True)
