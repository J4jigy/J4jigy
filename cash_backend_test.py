#!/usr/bin/env python3
"""
Backend API Testing for Cash In Entry Invoice Functionality
Tests backend health and cash-related APIs as requested in review
"""

import requests
import json
import time
from datetime import datetime
import sys

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
if not BACKEND_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"
print(f"Testing backend at: {API_BASE}")

# Global variables
auth_token = None
test_user_id = None

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ PASS: {test_name}")
        
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ FAIL: {test_name} - {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return len(self.errors) == 0

results = TestResults()

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
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=default_headers, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=default_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.Timeout:
        print(f"⚠️  Request timeout for {method} {url}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Request failed for {method} {url}: {e}")
        return None

def test_backend_health():
    """Test backend server health"""
    print("\n🔍 Testing Backend Server Health...")
    
    response = make_request("GET", "/ping")
    if not response:
        results.add_fail("Backend Health", "Server not responding")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "status" in data and data["status"] == "ok":
                results.add_pass("Backend Server Health")
                print(f"ℹ️  Backend server is running and healthy")
                return True
            else:
                results.add_fail("Backend Health", f"Invalid response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Backend Health", "Invalid JSON response")
    else:
        results.add_fail("Backend Health", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_mobile_login():
    """Test mobile login with mobile: 1234567890, password: admin123"""
    print("\n🔍 Testing Mobile Login (mobile: 1234567890, password: admin123)...")
    global auth_token, test_user_id
    
    # Try mobile login endpoint first
    mobile_login_data = {
        "mobile": "1234567890",
        "name": "Test User"
    }
    
    response = make_request("POST", "/auth/mobile-login", mobile_login_data)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                test_user_id = data["user"]["id"]
                results.add_pass("Mobile Login (1234567890)")
                print(f"ℹ️  Mobile login successful, user ID: {test_user_id}")
                return True
            else:
                results.add_fail("Mobile Login", f"Missing required fields: {data}")
        except json.JSONDecodeError:
            results.add_fail("Mobile Login", "Invalid JSON response")
    else:
        # Try regular login with admin/admin123 as fallback
        print("  Trying admin/admin123 login as fallback...")
        admin_login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        response = make_request("POST", "/auth/login", admin_login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if "access_token" in data and "user" in data:
                    auth_token = data["access_token"]
                    test_user_id = data["user"]["id"]
                    results.add_pass("Admin Login (admin/admin123)")
                    print(f"ℹ️  Admin login successful, user ID: {test_user_id}")
                    return True
                else:
                    results.add_fail("Login", f"Missing required fields: {data}")
            except json.JSONDecodeError:
                results.add_fail("Login", "Invalid JSON response")
        else:
            results.add_fail("Login", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
    
    return False

def test_cash_apis():
    """Test all cash-related APIs"""
    print("\n🔍 Testing Cash-Related APIs...")
    
    if not auth_token:
        results.add_fail("Cash APIs", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test 1: GET /api/transactions (all transactions)
    print("  Testing GET /api/transactions...")
    response = make_request("GET", "/transactions", headers=headers)
    
    if not response:
        results.add_fail("Cash APIs - GET transactions", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "transactions" in data and "total" in data:
                results.add_pass("Cash APIs - GET all transactions")
                print(f"ℹ️  Found {data['total']} total transactions")
            else:
                results.add_fail("Cash APIs - GET transactions", f"Invalid response: {data}")
                return False
        except json.JSONDecodeError:
            results.add_fail("Cash APIs - GET transactions", "Invalid JSON response")
            return False
    else:
        results.add_fail("Cash APIs - GET transactions", f"HTTP {response.status_code}: {response.text}")
        return False
    
    # Test 2: GET /api/transactions?transaction_type=cash_in
    print("  Testing GET /api/transactions?transaction_type=cash_in...")
    response = make_request("GET", "/transactions?transaction_type=cash_in", headers=headers)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            results.add_pass("Cash APIs - GET cash-in transactions")
            print(f"ℹ️  Found {data['total']} cash-in transactions")
        except json.JSONDecodeError:
            results.add_fail("Cash APIs - GET cash-in", "Invalid JSON response")
    else:
        results.add_fail("Cash APIs - GET cash-in", f"HTTP {response.status_code if response else 'No response'}")
    
    # Test 3: GET /api/transactions?transaction_type=cash_out
    print("  Testing GET /api/transactions?transaction_type=cash_out...")
    response = make_request("GET", "/transactions?transaction_type=cash_out", headers=headers)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            results.add_pass("Cash APIs - GET cash-out transactions")
            print(f"ℹ️  Found {data['total']} cash-out transactions")
        except json.JSONDecodeError:
            results.add_fail("Cash APIs - GET cash-out", "Invalid JSON response")
    else:
        results.add_fail("Cash APIs - GET cash-out", f"HTTP {response.status_code if response else 'No response'}")
    
    # Test 4: POST /api/transactions/cash-in (create cash-in transaction)
    print("  Testing POST /api/transactions/cash-in...")
    cash_in_data = {
        "description": "Test Invoice Payment",
        "amount": 2500.00,
        "debit_account": "Cash",
        "credit_account": "Sales Revenue"
    }
    
    response = make_request("POST", "/transactions/cash-in", cash_in_data, headers=headers)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            if "id" in data and "amount" in data and data["amount"] == 2500.00:
                results.add_pass("Cash APIs - POST cash-in transaction")
                print(f"ℹ️  Created cash-in transaction: ₹{data['amount']}")
            else:
                results.add_fail("Cash APIs - POST cash-in", f"Invalid response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Cash APIs - POST cash-in", "Invalid JSON response")
    else:
        results.add_fail("Cash APIs - POST cash-in", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
    
    # Test 5: POST /api/transactions/cash-out (create cash-out transaction)
    print("  Testing POST /api/transactions/cash-out...")
    cash_out_data = {
        "description": "Test Expense Payment",
        "amount": 750.00,
        "debit_account": "Operating Expenses",
        "credit_account": "Cash"
    }
    
    response = make_request("POST", "/transactions/cash-out", cash_out_data, headers=headers)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            if "id" in data and "amount" in data and data["amount"] == 750.00:
                results.add_pass("Cash APIs - POST cash-out transaction")
                print(f"ℹ️  Created cash-out transaction: ₹{data['amount']}")
            else:
                results.add_fail("Cash APIs - POST cash-out", f"Invalid response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Cash APIs - POST cash-out", "Invalid JSON response")
    else:
        results.add_fail("Cash APIs - POST cash-out", f"HTTP {response.status_code if response else 'No response'}: {response.text if response else 'Request failed'}")
    
    # Test 6: GET /api/dashboard/summary (verify cash data)
    print("  Testing GET /api/dashboard/summary...")
    response = make_request("GET", "/dashboard/summary", headers=headers)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            if "you_will_give" in data and "you_will_receive" in data:
                results.add_pass("Cash APIs - Dashboard summary")
                print(f"ℹ️  Dashboard summary - Give: ₹{data['you_will_give']}, Receive: ₹{data['you_will_receive']}")
            else:
                results.add_fail("Cash APIs - Dashboard summary", f"Invalid response: {data}")
        except json.JSONDecodeError:
            results.add_fail("Cash APIs - Dashboard summary", "Invalid JSON response")
    else:
        results.add_fail("Cash APIs - Dashboard summary", f"HTTP {response.status_code if response else 'No response'}")
    
    return True

def test_contacts_api():
    """Test contacts API for customer/supplier management"""
    print("\n🔍 Testing Contacts API (for invoice customers)...")
    
    if not auth_token:
        results.add_fail("Contacts API", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test GET /api/contacts
    print("  Testing GET /api/contacts...")
    response = make_request("GET", "/contacts", headers=headers)
    
    if not response:
        results.add_fail("Contacts API - GET", "Request failed")
        return False
    
    if response.status_code == 200:
        try:
            contacts = response.json()
            if isinstance(contacts, list):
                results.add_pass("Contacts API - GET contacts")
                print(f"ℹ️  Found {len(contacts)} contacts")
            else:
                results.add_fail("Contacts API - GET", f"Expected list, got: {type(contacts)}")
        except json.JSONDecodeError:
            results.add_fail("Contacts API - GET", "Invalid JSON response")
    else:
        results.add_fail("Contacts API - GET", f"HTTP {response.status_code}: {response.text}")
    
    # Test POST /api/contacts (create customer)
    print("  Testing POST /api/contacts (create customer)...")
    customer_data = {
        "name": "Test Customer Corp",
        "type": "customer",
        "email": "customer@testcorp.com",
        "phone": "+91-9876543210"
    }
    
    response = make_request("POST", "/contacts", customer_data, headers=headers)
    
    if response and response.status_code == 200:
        try:
            contact = response.json()
            if "id" in contact and contact["type"] == "customer":
                results.add_pass("Contacts API - POST customer")
                print(f"ℹ️  Created customer contact: {contact['name']}")
            else:
                results.add_fail("Contacts API - POST", f"Invalid response: {contact}")
        except json.JSONDecodeError:
            results.add_fail("Contacts API - POST", "Invalid JSON response")
    else:
        results.add_fail("Contacts API - POST", f"HTTP {response.status_code if response else 'No response'}")
    
    return True

def check_backend_logs():
    """Check backend logs for any errors"""
    print("\n🔍 Checking Backend Logs for Errors...")
    
    try:
        import subprocess
        
        # Check backend error logs
        log_result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.err.log"],
            capture_output=True, text=True, timeout=10
        )
        
        error_lines = []
        for line in log_result.stdout.split('\n'):
            if line.strip() and any(keyword in line.lower() for keyword in ['error', 'exception', 'traceback', 'failed']):
                error_lines.append(line)
        
        if error_lines:
            print(f"⚠️  Found {len(error_lines)} error lines in backend logs:")
            for line in error_lines[-10:]:  # Show last 10 errors
                print(f"    {line}")
            results.add_fail("Backend Logs", f"Found {len(error_lines)} error lines")
        else:
            results.add_pass("Backend Logs - No Errors")
            print("ℹ️  No errors found in backend logs")
        
        # Check backend output logs for recent activity
        log_result = subprocess.run(
            ["tail", "-n", "30", "/var/log/supervisor/backend.out.log"],
            capture_output=True, text=True, timeout=10
        )
        
        print("\nℹ️  Recent backend activity:")
        recent_lines = log_result.stdout.split('\n')[-10:]
        for line in recent_lines:
            if line.strip():
                print(f"    {line}")
        
    except Exception as e:
        print(f"⚠️  Could not check backend logs: {e}")
        results.add_fail("Backend Logs Check", f"Failed to read logs: {e}")

def run_tests():
    """Run all tests for cash in entry invoice functionality"""
    print(f"🚀 Starting Backend Tests for Cash In Entry Invoice Functionality")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Test Focus: Backend health and cash-related APIs")
    print(f"Review Context: Frontend-only styling change (dark theme restoration)")
    
    # Test sequence
    tests = [
        test_backend_health,
        test_mobile_login,
        test_cash_apis,
        test_contacts_api,
        check_backend_logs,
    ]
    
    for test_func in tests:
        try:
            test_func()
            time.sleep(0.5)  # Brief pause between tests
        except Exception as e:
            results.add_fail(test_func.__name__, f"Test execution error: {e}")
    
    # Final summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
