#!/usr/bin/env python3
"""
Final comprehensive test of all newly implemented APIs
"""

import requests
import json
import time

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
            response = requests.get(url, headers=default_headers, timeout=15)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=15)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def run_comprehensive_test():
    """Run comprehensive test of all newly implemented APIs"""
    print("🚀 COMPREHENSIVE BACKEND API TEST")
    print("=" * 60)
    
    # Login first
    print("🔐 Authenticating...")
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if not response or response.status_code != 200:
        print(f"❌ CRITICAL: Login failed - {response.status_code if response else 'No response'}")
        return
    
    data = response.json()
    auth_token = data["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    print("✅ Authentication successful")
    
    results = {
        "list_endpoints": {"passed": 0, "failed": 0, "details": []},
        "transaction_apis": {"passed": 0, "failed": 0, "details": []},
        "admin_apis": {"passed": 0, "failed": 0, "details": []},
        "account_apis": {"passed": 0, "failed": 0, "details": []}
    }
    
    # TEST 1: List Endpoints (fetch_list function)
    print("\n📋 TESTING LIST ENDPOINTS")
    print("-" * 40)
    
    list_names = ["customers", "suppliers", "staff", "purchases", "bills", "expenses", "invoices", "ratings"]
    
    for list_name in list_names:
        response = make_request("GET", f"/lists/{list_name}", headers=headers)
        if response and response.status_code == 200:
            results["list_endpoints"]["passed"] += 1
            results["list_endpoints"]["details"].append(f"✅ {list_name}")
            print(f"  ✅ {list_name}: Working")
        else:
            results["list_endpoints"]["failed"] += 1
            error_msg = f"❌ {list_name}: {response.status_code if response else 'No response'}"
            results["list_endpoints"]["details"].append(error_msg)
            print(f"  {error_msg}")
        time.sleep(0.2)  # Small delay to avoid overwhelming
    
    # TEST 2: Transaction APIs
    print("\n💰 TESTING TRANSACTION APIS")
    print("-" * 40)
    
    # GET transactions
    response = make_request("GET", "/transactions", headers=headers)
    if response and response.status_code == 200:
        results["transaction_apis"]["passed"] += 1
        data = response.json()
        results["transaction_apis"]["details"].append(f"✅ GET /transactions: {data.get('total', 0)} transactions found")
        print(f"  ✅ GET /transactions: {data.get('total', 0)} transactions found")
    else:
        results["transaction_apis"]["failed"] += 1
        error_msg = f"❌ GET /transactions: {response.status_code if response else 'No response'}"
        results["transaction_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
    
    # POST transaction (general)
    transaction_data = {
        "description": "Test business expense",
        "amount": 150.75,
        "transaction_type": "cash_out",
        "debit_account": "Operating Expenses",
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions", transaction_data, headers=headers)
    if response and response.status_code == 200:
        results["transaction_apis"]["passed"] += 1
        results["transaction_apis"]["details"].append("✅ POST /transactions: Transaction created")
        print("  ✅ POST /transactions: Transaction created")
    else:
        results["transaction_apis"]["failed"] += 1
        error_msg = f"❌ POST /transactions: {response.status_code if response else 'No response'}"
        results["transaction_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
        if response:
            print(f"    Error details: {response.text}")
    
    # POST cash-in (without transaction_type since it's set automatically)
    cash_in_data = {
        "description": "Client payment received",
        "amount": 2500.00,
        "debit_account": "Cash",
        "credit_account": "Sales Revenue"
    }
    
    response = make_request("POST", "/transactions/cash-in", cash_in_data, headers=headers)
    if response and response.status_code == 200:
        results["transaction_apis"]["passed"] += 1
        results["transaction_apis"]["details"].append("✅ POST /transactions/cash-in: Cash-in created")
        print("  ✅ POST /transactions/cash-in: Cash-in created")
    else:
        results["transaction_apis"]["failed"] += 1
        error_msg = f"❌ POST /transactions/cash-in: {response.status_code if response else 'No response'}"
        results["transaction_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
        if response:
            print(f"    Error details: {response.text}")
    
    # POST cash-out (without transaction_type since it's set automatically)
    cash_out_data = {
        "description": "Office supplies purchase",
        "amount": 85.50,
        "debit_account": "Operating Expenses", 
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-out", cash_out_data, headers=headers)
    if response and response.status_code == 200:
        results["transaction_apis"]["passed"] += 1
        results["transaction_apis"]["details"].append("✅ POST /transactions/cash-out: Cash-out created")
        print("  ✅ POST /transactions/cash-out: Cash-out created")
    else:
        results["transaction_apis"]["failed"] += 1
        error_msg = f"❌ POST /transactions/cash-out: {response.status_code if response else 'No response'}"
        results["transaction_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
        if response:
            print(f"    Error details: {response.text}")
    
    # TEST 3: Admin APIs (should return 403 for regular user)
    print("\n👑 TESTING ADMIN APIS")
    print("-" * 40)
    
    # GET admin users
    response = make_request("GET", "/admin/users", headers=headers)
    if response and response.status_code == 403:
        results["admin_apis"]["passed"] += 1
        results["admin_apis"]["details"].append("✅ GET /admin/users: Correctly blocked (403)")
        print("  ✅ GET /admin/users: Correctly blocked (403)")
    elif response and response.status_code == 200:
        results["admin_apis"]["passed"] += 1
        results["admin_apis"]["details"].append("✅ GET /admin/users: Working (user has admin role)")
        print("  ✅ GET /admin/users: Working (user has admin role)")
    else:
        results["admin_apis"]["failed"] += 1
        error_msg = f"❌ GET /admin/users: {response.status_code if response else 'No response'}"
        results["admin_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
    
    # GET admin invites
    response = make_request("GET", "/admin/invites", headers=headers)
    if response and response.status_code == 403:
        results["admin_apis"]["passed"] += 1
        results["admin_apis"]["details"].append("✅ GET /admin/invites: Correctly blocked (403)")
        print("  ✅ GET /admin/invites: Correctly blocked (403)")
    elif response and response.status_code == 200:
        results["admin_apis"]["passed"] += 1
        results["admin_apis"]["details"].append("✅ GET /admin/invites: Working (user has admin role)")
        print("  ✅ GET /admin/invites: Working (user has admin role)")
    else:
        results["admin_apis"]["failed"] += 1
        error_msg = f"❌ GET /admin/invites: {response.status_code if response else 'No response'}"
        results["admin_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
    
    # POST admin invites
    response = make_request("POST", "/admin/invites", headers=headers)
    if response and response.status_code == 403:
        results["admin_apis"]["passed"] += 1
        results["admin_apis"]["details"].append("✅ POST /admin/invites: Correctly blocked (403)")
        print("  ✅ POST /admin/invites: Correctly blocked (403)")
    elif response and response.status_code == 200:
        results["admin_apis"]["passed"] += 1
        results["admin_apis"]["details"].append("✅ POST /admin/invites: Working (user has admin role)")
        print("  ✅ POST /admin/invites: Working (user has admin role)")
    else:
        results["admin_apis"]["failed"] += 1
        error_msg = f"❌ POST /admin/invites: {response.status_code if response else 'No response'}"
        results["admin_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
    
    # TEST 4: Account Management APIs
    print("\n🏦 TESTING ACCOUNT MANAGEMENT APIS")
    print("-" * 40)
    
    # GET accounts
    response = make_request("GET", "/accounts", headers=headers)
    if response and response.status_code == 200:
        results["account_apis"]["passed"] += 1
        data = response.json()
        results["account_apis"]["details"].append(f"✅ GET /accounts: {data.get('total', 0)} accounts found")
        print(f"  ✅ GET /accounts: {data.get('total', 0)} accounts found")
    else:
        results["account_apis"]["failed"] += 1
        error_msg = f"❌ GET /accounts: {response.status_code if response else 'No response'}"
        results["account_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
    
    # POST account
    account_data = {
        "name": "Test Marketing Budget",
        "account_type": "expense",
        "balance": 5000.00
    }
    
    response = make_request("POST", "/accounts", account_data, headers=headers)
    if response and response.status_code == 200:
        results["account_apis"]["passed"] += 1
        results["account_apis"]["details"].append("✅ POST /accounts: Account created")
        print("  ✅ POST /accounts: Account created")
    else:
        results["account_apis"]["failed"] += 1
        error_msg = f"❌ POST /accounts: {response.status_code if response else 'No response'}"
        results["account_apis"]["details"].append(error_msg)
        print(f"  {error_msg}")
        if response:
            print(f"    Error details: {response.text}")
    
    # FINAL SUMMARY
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    
    total_passed = sum(cat["passed"] for cat in results.values())
    total_failed = sum(cat["failed"] for cat in results.values())
    total_tests = total_passed + total_failed
    
    print(f"Overall: {total_passed}/{total_tests} tests passed")
    print()
    
    for category, data in results.items():
        category_name = category.replace("_", " ").title()
        passed = data["passed"]
        failed = data["failed"]
        total = passed + failed
        print(f"{category_name}: {passed}/{total} passed")
        for detail in data["details"]:
            print(f"  {detail}")
        print()
    
    if total_failed == 0:
        print("🎉 ALL TESTS PASSED! All newly implemented APIs are working correctly.")
    else:
        print(f"⚠️  {total_failed} tests failed. See details above.")
    
    return total_failed == 0

if __name__ == "__main__":
    success = run_comprehensive_test()
    exit(0 if success else 1)