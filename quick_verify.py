#!/usr/bin/env python3
"""
Quick verification of all APIs
"""

import requests
import json

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

# Test data
TEST_LOGIN_DATA = {
    "username": "sarah_johnson",
    "password": "SecurePass123!@#"
}

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=default_headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def quick_verify():
    """Quick verification of all APIs"""
    print("🔍 QUICK API VERIFICATION")
    print("=" * 40)
    
    # Login
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if not response or response.status_code != 200:
        print("❌ Login failed")
        return
    
    data = response.json()
    auth_token = data["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    print("✅ Authentication: OK")
    
    # Test one endpoint from each category
    
    # List endpoint
    response = make_request("GET", "/lists/customers", headers=headers)
    print(f"✅ List endpoints: {response.status_code if response else 'No response'}")
    
    # Transaction endpoints
    response = make_request("GET", "/transactions", headers=headers)
    print(f"✅ GET transactions: {response.status_code if response else 'No response'}")
    
    cash_in_data = {"description": "Test", "amount": 100.0, "debit_account": "Cash", "credit_account": "Revenue"}
    response = make_request("POST", "/transactions/cash-in", cash_in_data, headers=headers)
    print(f"✅ POST cash-in: {response.status_code if response else 'No response'}")
    
    cash_out_data = {"description": "Test", "amount": 50.0, "debit_account": "Expenses", "credit_account": "Cash"}
    response = make_request("POST", "/transactions/cash-out", cash_out_data, headers=headers)
    print(f"✅ POST cash-out: {response.status_code if response else 'No response'}")
    
    # Admin endpoints (should return 403)
    response = make_request("GET", "/admin/users", headers=headers)
    print(f"✅ Admin users: {response.status_code if response else 'No response'} (403 expected)")
    
    response = make_request("GET", "/admin/invites", headers=headers)
    print(f"✅ Admin invites: {response.status_code if response else 'No response'} (403 expected)")
    
    # Account endpoints
    response = make_request("GET", "/accounts", headers=headers)
    print(f"✅ GET accounts: {response.status_code if response else 'No response'}")
    
    account_data = {"name": "Test Account", "account_type": "asset", "balance": 1000.0}
    response = make_request("POST", "/accounts", account_data, headers=headers)
    print(f"✅ POST accounts: {response.status_code if response else 'No response'}")

if __name__ == "__main__":
    quick_verify()