#!/usr/bin/env python3
"""
Backend API Testing Suite for Financial Dashboard
Tests all backend endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
import os
import sys

# Load environment variables
sys.path.append('/app/frontend')
sys.path.append('/app/backend')

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

# Test data - using realistic business data
TEST_USER_DATA = {
    "username": "sarah_johnson",
    "email": "sarah.johnson@techstartup.com", 
    "password": "SecurePass123!@#",
    "business_name": "TechStartup Solutions LLC",
    "invite_code": "OPEN"
}

TEST_LOGIN_DATA = {
    "username": "sarah_johnson",
    "password": "SecurePass123!@#"
}

# Global variables for test state
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

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
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
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_api_health():
    """Test API health check endpoint"""
    print("\n🔍 Testing API Health Check...")
    
    response = make_request("GET", "/ping")
    if not response:
        results.add_fail("API Health Check", "Request failed - server not responding")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "status" in data and data["status"] == "ok":
                results.add_pass("API Health Check")
                return True
            else:
                results.add_fail("API Health Check", f"Invalid response format: {data}")
        except json.JSONDecodeError:
            results.add_fail("API Health Check", "Invalid JSON response")
    else:
        results.add_fail("API Health Check", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_user_registration():
    """Test user registration endpoint"""
    print("\n🔍 Testing User Registration...")
    global test_user_id
    
    response = make_request("POST", "/auth/register", TEST_USER_DATA)
    if not response:
        results.add_fail("User Registration", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                test_user_id = data["user"]["id"]
                results.add_pass("User Registration")
                return True
            else:
                results.add_fail("User Registration", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("User Registration", "Invalid JSON response")
    elif response.status_code == 400:
        # User might already exist, try to continue with login
        try:
            error_data = response.json()
            if "Username already exists" in error_data.get("detail", ""):
                print("ℹ️  User already exists, will test login instead")
                return True
        except:
            pass
        results.add_fail("User Registration", f"HTTP {response.status_code}: {response.text}")
    else:
        results.add_fail("User Registration", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_user_login():
    """Test user login endpoint"""
    print("\n🔍 Testing User Login...")
    global auth_token, test_user_id
    
    response = make_request("POST", "/auth/login", TEST_LOGIN_DATA)
    if not response:
        results.add_fail("User Login", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                test_user_id = data["user"]["id"]
                results.add_pass("User Login")
                return True
            else:
                results.add_fail("User Login", f"Missing required fields in response: {data}")
        except json.JSONDecodeError:
            results.add_fail("User Login", "Invalid JSON response")
    else:
        results.add_fail("User Login", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_dashboard_summary():
    """Test dashboard summary endpoint (requires authentication)"""
    print("\n🔍 Testing Dashboard Summary...")
    
    if not auth_token:
        results.add_fail("Dashboard Summary", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = make_request("GET", "/dashboard/summary", headers=headers)
    
    if not response:
        results.add_fail("Dashboard Summary", "Request failed")
        return False
        
    if response.status_code == 200:
        try:
            data = response.json()
            required_fields = ["you_will_give", "you_will_receive", "net_position"]
            if all(field in data for field in required_fields):
                results.add_pass("Dashboard Summary")
                return True
            else:
                results.add_fail("Dashboard Summary", f"Missing required fields: {data}")
        except json.JSONDecodeError:
            results.add_fail("Dashboard Summary", "Invalid JSON response")
    elif response.status_code == 401:
        results.add_fail("Dashboard Summary", "Authentication failed - invalid token")
    else:
        results.add_fail("Dashboard Summary", f"HTTP {response.status_code}: {response.text}")
    
    return False

def test_list_endpoints():
    """Test various list endpoints"""
    print("\n🔍 Testing List Endpoints...")
    
    if not auth_token:
        results.add_fail("List Endpoints", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    list_names = ["customers", "suppliers", "staff", "purchases", "bills", "expenses", "invoices", "ratings"]
    
    passed_lists = 0
    failed_lists = []
    for list_name in list_names:
        response = make_request("GET", f"/lists/{list_name}", headers=headers)
        
        if response and response.status_code == 200:
            passed_lists += 1
        elif response and response.status_code == 401:
            results.add_fail(f"List Endpoint ({list_name})", "Authentication failed")
            return False
        elif response and response.status_code == 500:
            failed_lists.append(f"{list_name} (Internal Server Error)")
        # Note: Some lists might return empty results or 404, which is acceptable
    
    if failed_lists:
        results.add_fail("List Endpoints", f"Internal server errors: {', '.join(failed_lists)}")
        return False
    elif passed_lists > 0:
        results.add_pass(f"List Endpoints ({passed_lists}/{len(list_names)} accessible)")
        return True
    else:
        results.add_fail("List Endpoints", "No list endpoints accessible")
        return False

def test_missing_endpoints():
    """Test for missing critical endpoints"""
    print("\n🔍 Testing Missing Critical Endpoints...")
    
    if not auth_token:
        results.add_fail("Missing Endpoints Check", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    missing_endpoints = []
    
    # Test transaction endpoints that should exist for a financial dashboard
    critical_endpoints = [
        ("/transactions", "GET", "Transaction List"),
        ("/transactions", "POST", "Create Transaction"),
        ("/transactions/cash-in", "POST", "Cash In Transaction"),
        ("/transactions/cash-out", "POST", "Cash Out Transaction"),
        ("/admin/invites", "GET", "Admin Invite Management"),
        ("/admin/users", "GET", "Admin User Management"),
        ("/accounts", "GET", "Account Management")
    ]
    
    for endpoint, method, description in critical_endpoints:
        response = make_request(method, endpoint, headers=headers)
        if not response or response.status_code == 404:
            missing_endpoints.append(f"{method} {endpoint} ({description})")
    
    if missing_endpoints:
        results.add_fail("Missing Critical Endpoints", f"Missing: {', '.join(missing_endpoints)}")
        return False
    else:
        results.add_pass("All Critical Endpoints Present")
        return True

def test_cors_headers():
    """Test CORS headers are properly set"""
    print("\n🔍 Testing CORS Headers...")
    
    # Test OPTIONS request
    try:
        response = requests.options(f"{API_BASE}/ping", timeout=10)
        if response.status_code in [200, 204]:
            cors_headers = [
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods", 
                "Access-Control-Allow-Headers"
            ]
            
            has_cors = any(header in response.headers for header in cors_headers)
            if has_cors:
                results.add_pass("CORS Headers")
                return True
            else:
                results.add_fail("CORS Headers", "Missing CORS headers in OPTIONS response")
        else:
            results.add_fail("CORS Headers", f"OPTIONS request failed: HTTP {response.status_code}")
    except Exception as e:
        results.add_fail("CORS Headers", f"OPTIONS request failed: {e}")
    
    return False

def test_authentication_security():
    """Test authentication security measures"""
    print("\n🔍 Testing Authentication Security...")
    
    # Test access to protected endpoint without token
    response = make_request("GET", "/dashboard/summary")
    if response and response.status_code in [401, 403]:
        results.add_pass("Authentication Security - Unauthorized Access Blocked")
    else:
        results.add_fail("Authentication Security", f"Protected endpoint accessible without token: HTTP {response.status_code if response else 'No response'}")
        return False
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = make_request("GET", "/dashboard/summary", headers=headers)
    if response and response.status_code in [401, 403]:
        results.add_pass("Authentication Security - Invalid Token Rejected")
        return True
    else:
        results.add_fail("Authentication Security", f"Invalid token accepted: HTTP {response.status_code if response else 'No response'}")
        return False

def run_all_tests():
    """Run all backend tests in sequence"""
    print(f"🚀 Starting Backend API Tests")
    print(f"Backend URL: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test sequence - order matters for authentication flow
    tests = [
        test_api_health,
        test_cors_headers,
        test_authentication_security,
        test_user_registration,
        test_user_login,
        test_dashboard_summary,
        test_list_endpoints,
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
    success = run_all_tests()
    sys.exit(0 if success else 1)