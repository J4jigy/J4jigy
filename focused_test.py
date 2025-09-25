#!/usr/bin/env python3
"""
Focused Backend API Testing for newly implemented APIs
"""

import requests
import json
import time
from datetime import datetime

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
print(f"Testing backend at: {API_BASE}")

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
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_focused_apis():
    """Test the specific APIs mentioned in the review request"""
    print(f"🚀 Starting Focused Backend API Tests")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # First login to get auth token
    print("\n🔍 Logging in...")
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if not response or response.status_code != 200:
        print(f"❌ Login failed: {response.status_code if response else 'No response'}")
        return
    
    data = response.json()
    auth_token = data["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    print("✅ Login successful")
    
    # Test 1: List Endpoints (fetch_list function)
    print("\n🔍 Testing List Endpoints (fetch_list function)...")
    list_names = ["customers", "suppliers", "staff", "purchases", "bills", "expenses", "invoices", "ratings"]
    
    list_success = 0
    list_failures = []
    
    for list_name in list_names:
        response = make_request("GET", f"/lists/{list_name}", headers=headers)
        if response and response.status_code == 200:
            list_success += 1
            print(f"  ✅ {list_name}: OK")
        else:
            list_failures.append(f"{list_name}: {response.status_code if response else 'No response'}")
            print(f"  ❌ {list_name}: {response.status_code if response else 'No response'}")
    
    print(f"📊 List Endpoints: {list_success}/{len(list_names)} working")
    
    # Test 2: Transaction APIs
    print("\n🔍 Testing Transaction APIs...")
    
    # GET /api/transactions
    response = make_request("GET", "/transactions", headers=headers)
    if response and response.status_code == 200:
        print("  ✅ GET /api/transactions: OK")
        data = response.json()
        print(f"    Found {data.get('total', 0)} transactions")
    else:
        print(f"  ❌ GET /api/transactions: {response.status_code if response else 'No response'}")
    
    # POST /api/transactions
    transaction_data = {
        "description": "Test business expense",
        "amount": 150.75,
        "transaction_type": "cash_out",
        "debit_account": "Operating Expenses",
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions", transaction_data, headers=headers)
    if response and response.status_code == 200:
        print("  ✅ POST /api/transactions: OK")
    else:
        print(f"  ❌ POST /api/transactions: {response.status_code if response else 'No response'}")
        if response:
            print(f"    Error: {response.text}")
    
    # POST /api/transactions/cash-in
    cash_in_data = {
        "description": "Client payment received",
        "amount": 2500.00,
        "debit_account": "Cash",
        "credit_account": "Sales Revenue"
    }
    
    response = make_request("POST", "/transactions/cash-in", cash_in_data, headers=headers)
    if response and response.status_code == 200:
        print("  ✅ POST /api/transactions/cash-in: OK")
    else:
        print(f"  ❌ POST /api/transactions/cash-in: {response.status_code if response else 'No response'}")
        if response:
            print(f"    Error: {response.text}")
    
    # POST /api/transactions/cash-out
    cash_out_data = {
        "description": "Office supplies purchase",
        "amount": 85.50,
        "debit_account": "Operating Expenses", 
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-out", cash_out_data, headers=headers)
    if response and response.status_code == 200:
        print("  ✅ POST /api/transactions/cash-out: OK")
    else:
        print(f"  ❌ POST /api/transactions/cash-out: {response.status_code if response else 'No response'}")
        if response:
            print(f"    Error: {response.text}")
    
    # Test 3: Admin APIs (should return 403 for regular user)
    print("\n🔍 Testing Admin APIs...")
    
    # GET /api/admin/users
    response = make_request("GET", "/admin/users", headers=headers)
    if response and response.status_code == 403:
        print("  ✅ GET /api/admin/users: Correctly returns 403 (access control working)")
    elif response and response.status_code == 200:
        print("  ✅ GET /api/admin/users: OK (user has admin role)")
    else:
        print(f"  ❌ GET /api/admin/users: {response.status_code if response else 'No response'}")
    
    # GET /api/admin/invites
    response = make_request("GET", "/admin/invites", headers=headers)
    if response and response.status_code == 403:
        print("  ✅ GET /api/admin/invites: Correctly returns 403 (access control working)")
    elif response and response.status_code == 200:
        print("  ✅ GET /api/admin/invites: OK (user has admin role)")
    else:
        print(f"  ❌ GET /api/admin/invites: {response.status_code if response else 'No response'}")
    
    # POST /api/admin/invites
    response = make_request("POST", "/admin/invites", headers=headers)
    if response and response.status_code == 403:
        print("  ✅ POST /api/admin/invites: Correctly returns 403 (access control working)")
    elif response and response.status_code == 200:
        print("  ✅ POST /api/admin/invites: OK (user has admin role)")
    else:
        print(f"  ❌ POST /api/admin/invites: {response.status_code if response else 'No response'}")
    
    # Test 4: Account Management APIs
    print("\n🔍 Testing Account Management APIs...")
    
    # GET /api/accounts
    response = make_request("GET", "/accounts", headers=headers)
    if response and response.status_code == 200:
        print("  ✅ GET /api/accounts: OK")
        data = response.json()
        print(f"    Found {data.get('total', 0)} accounts")
    else:
        print(f"  ❌ GET /api/accounts: {response.status_code if response else 'No response'}")
    
    # POST /api/accounts
    account_data = {
        "name": "Test Marketing Budget",
        "account_type": "expense",
        "balance": 5000.00
    }
    
    response = make_request("POST", "/accounts", account_data, headers=headers)
    if response and response.status_code == 200:
        print("  ✅ POST /api/accounts: OK")
    else:
        print(f"  ❌ POST /api/accounts: {response.status_code if response else 'No response'}")
        if response:
            print(f"    Error: {response.text}")
    
    print(f"\n🏁 Focused testing complete at {datetime.now().isoformat()}")

if __name__ == "__main__":
    test_focused_apis()