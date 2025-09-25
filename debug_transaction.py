#!/usr/bin/env python3
"""
Debug transaction API validation errors
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

def debug_transactions():
    """Debug transaction validation errors"""
    print("🔍 Debugging Transaction API Validation...")
    
    # Login first
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if not response or response.status_code != 200:
        print(f"❌ Login failed")
        return
    
    data = response.json()
    auth_token = data["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test cash-in with detailed error reporting
    print("\n🔍 Testing POST /api/transactions/cash-in...")
    cash_in_data = {
        "description": "Client payment received",
        "amount": 2500.00,
        "debit_account": "Cash",
        "credit_account": "Sales Revenue"
    }
    
    response = make_request("POST", "/transactions/cash-in", cash_in_data, headers=headers)
    if response:
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        try:
            error_data = response.json()
            print(f"JSON Error: {json.dumps(error_data, indent=2)}")
        except:
            pass
    else:
        print("No response received")
    
    # Test cash-out with detailed error reporting
    print("\n🔍 Testing POST /api/transactions/cash-out...")
    cash_out_data = {
        "description": "Office supplies purchase",
        "amount": 85.50,
        "debit_account": "Operating Expenses", 
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-out", cash_out_data, headers=headers)
    if response:
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        try:
            error_data = response.json()
            print(f"JSON Error: {json.dumps(error_data, indent=2)}")
        except:
            pass
    else:
        print("No response received")

if __name__ == "__main__":
    debug_transactions()